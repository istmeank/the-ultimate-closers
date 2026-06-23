// track-analytics — Edge Function TUC
// Remplace l'INSERT direct public sur site_analytics (BLOCKER H9).
// Pipeline : Upstash rate limit → validation → INSERT service_role
//
// Rate limits (Sliding Window) :
//   - 100 req/min par IP (trafic légitime navigateur)
//   - 1000 req/h global (protection DoS macroéconomique)
// Pas de Turnstile ici : endpoint analytics hit à chaque page view, Turnstile serait trop intrusif
// BLOCKER H9 — Vague 2

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Ratelimit } from "npm:@upstash/ratelimit@1";
import { Redis } from "npm:@upstash/redis@1";

// Types
interface AnalyticsRequest {
  event_type: string;
  page_path?: string;
  metadata?: Record<string, unknown>;
}

function validateBody(body: unknown): AnalyticsRequest {
  const b = body as AnalyticsRequest;

  if (!b.event_type || typeof b.event_type !== "string" ||
      b.event_type.trim().length < 1 || b.event_type.trim().length > 100) {
    throw new Error("event_type invalide (1-100 caractères)");
  }
  if (b.page_path && b.page_path.length > 500) {
    throw new Error("page_path trop long (max 500)");
  }
  // Sanitize metadata : accepter seulement des types primitifs
  if (b.metadata !== undefined) {
    if (typeof b.metadata !== "object" || Array.isArray(b.metadata)) {
      throw new Error("metadata doit être un objet");
    }
    // Limiter la taille pour éviter les bombes JSON
    if (JSON.stringify(b.metadata).length > 2000) {
      throw new Error("metadata trop volumineux (max 2000 chars)");
    }
  }

  return b;
}

// Initialisation Upstash Redis
const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

// Sliding Window : 100 req/min par IP (navigateur légitime)
const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "tuc_analytics_ip",
});

// Sliding Window : 1000 req/h global (protection DoS macro)
const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "1 h"),
  analytics: true,
  prefix: "tuc_analytics_global",
});

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";

  try {
    const body = await req.json();
    const request = validateBody(body);

    // ----------------------------------------------------------------
    // 1. RATE LIMITING — IP + Global (Sliding Window)
    // ----------------------------------------------------------------
    const [ipResult, globalResult] = await Promise.all([
      ipRatelimit.limit(`ip_${ip}`),
      globalRatelimit.limit("global"),
    ]);

    if (!ipResult.success || !globalResult.success) {
      const resetMs = Math.max(ipResult.reset, globalResult.reset);
      const retryAfter = Math.ceil((resetMs - Date.now()) / 1000);

      // Pour l'analytics, on logue silencieusement sans bloquer l'UX
      console.log(JSON.stringify({
        event: "analytics_rate_limit_hit",
        ip,
        blocked_by: !ipResult.success ? "ip" : "global",
        ts: new Date().toISOString(),
      }));

      // Retourner 429 mais sans message intrusif (l'analytics est transparent pour l'utilisateur)
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Veuillez patienter." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // ----------------------------------------------------------------
    // 2. Récupérer l'utilisateur connecté (optionnel — analytics peut être anonyme)
    // ----------------------------------------------------------------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      userId = user?.id ?? null;
    }

    // ----------------------------------------------------------------
    // 3. INSERT via service_role
    // ----------------------------------------------------------------
    const { error } = await supabase
      .from("site_analytics")
      .insert({
        event_type: request.event_type.trim(),
        page_path: request.page_path?.trim() ?? null,
        user_id: userId,
        metadata: request.metadata ?? {},
      });

    if (error) throw new Error(`DB insert: ${error.message}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error(JSON.stringify({ event: "track_analytics_error", message, ts: new Date().toISOString() }));

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
