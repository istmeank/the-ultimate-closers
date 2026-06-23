// submit-call-booking — Edge Function TUC
// Remplace l'INSERT direct public sur call_bookings (BLOCKER H8).
// Pipeline : Turnstile (optionnel) → Upstash rate limit → validation → INSERT service_role
//
// Rate limits (Sliding Window) :
//   - 3 req/min par IP
//   - 1 req/min par email
// Turnstile : optionnel au déploiement, activé dès que TURNSTILE_SECRET_KEY est présent
// BLOCKER H8 — Vague 2

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Ratelimit } from "npm:@upstash/ratelimit@1";
import { Redis } from "npm:@upstash/redis@1";

// Types
interface CallBookingRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  main_challenge?: string;
  turnstile_token?: string;
}

// Validation stricte des champs
function validateBody(body: unknown): CallBookingRequest {
  const b = body as CallBookingRequest;

  if (!b.first_name || b.first_name.trim().length < 1 || b.first_name.trim().length > 50) {
    throw new Error("first_name invalide (1-50 caractères)");
  }
  if (!b.last_name || b.last_name.trim().length < 1 || b.last_name.trim().length > 50) {
    throw new Error("last_name invalide (1-50 caractères)");
  }
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    throw new Error("email invalide");
  }
  if (b.phone && (b.phone.length < 6 || b.phone.length > 30)) {
    throw new Error("phone invalide (6-30 caractères)");
  }
  if (b.company_name && b.company_name.length > 100) {
    throw new Error("company_name trop long (max 100)");
  }
  if (b.main_challenge && b.main_challenge.length > 2000) {
    throw new Error("main_challenge trop long (max 2000)");
  }

  return b;
}

// Initialisation Upstash Redis (connectionless HTTP — compatible Deno Edge)
const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

// Sliding Window : 3 req/min par IP
const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "tuc_booking_ip",
});

// Sliding Window : 1 req/min par email (anti-rotation de comptes)
const emailRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 m"),
  analytics: true,
  prefix: "tuc_booking_email",
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

  // IP du visiteur (Vercel/Supabase forwarde via x-forwarded-for)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";

  try {
    const body = await req.json();
    const request = validateBody(body);

    // ----------------------------------------------------------------
    // 1. TURNSTILE — filtre anti-bot gratuit (optionnel)
    //    Activé uniquement si TURNSTILE_SECRET_KEY est configuré
    // ----------------------------------------------------------------
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (turnstileSecret && request.turnstile_token) {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${turnstileSecret}&response=${request.turnstile_token}&remoteip=${ip}`,
          signal: AbortSignal.timeout(5000),
        }
      );
      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return new Response(
          JSON.stringify({ error: "Validation anti-bot échouée. Veuillez réessayer." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // ----------------------------------------------------------------
    // 2. RATE LIMITING — double check IP + Email (Sliding Window)
    //    Consomme 2 commandes Upstash par requête légitime
    // ----------------------------------------------------------------
    const [ipResult, emailResult] = await Promise.all([
      ipRatelimit.limit(`ip_${ip}`),
      emailRatelimit.limit(`email_${request.email.toLowerCase()}`),
    ]);

    if (!ipResult.success || !emailResult.success) {
      const resetMs = Math.max(ipResult.reset, emailResult.reset);
      const retryAfter = Math.ceil((resetMs - Date.now()) / 1000);

      console.log(JSON.stringify({
        event: "rate_limit_hit",
        ip,
        email: request.email,
        blocked_by: !ipResult.success ? "ip" : "email",
        ts: new Date().toISOString(),
      }));

      return new Response(
        JSON.stringify({
          error: "Trop de tentatives. Pour garantir la sécurité, l'accès est temporairement restreint. Veuillez réessayer dans quelques instants.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // ----------------------------------------------------------------
    // 3. INSERT via service_role — jamais via l'API publique anon
    // ----------------------------------------------------------------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from("call_bookings")
      .insert({
        first_name: request.first_name.trim(),
        last_name: request.last_name.trim(),
        email: request.email.toLowerCase().trim(),
        phone: request.phone?.trim() ?? null,
        company_name: request.company_name?.trim() ?? null,
        main_challenge: request.main_challenge?.trim() ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw new Error(`DB insert: ${error.message}`);

    console.log(JSON.stringify({
      event: "call_booking_created",
      booking_id: data.id,
      ts: new Date().toISOString(),
    }));

    return new Response(
      JSON.stringify({ success: true, booking_id: data.id }),
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
    console.error(JSON.stringify({ event: "submit_call_booking_error", message, ts: new Date().toISOString() }));

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
