// get-oauth-token — Edge Function TUC
// Déchiffre just-in-time un token OAuth depuis Supabase Vault.
// Usage : appelée par les autres Edge Functions qui ont besoin
// d'un token pour appeler une API tierce (Google, Slack, HubSpot…)
//
// INTERDIT : logger le token déchiffré, le mettre en cache, le retourner au frontend.
// BLOCKER-001 — Vague 2

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
interface GetTokenRequest {
  table: "closer_integrations" | "google_calendar_tokens";
  user_id: string;
  token_type: "access" | "refresh";
  // Requis uniquement pour closer_integrations
  integration_type?:
    | "google_calendar"
    | "slack"
    | "hubspot"
    | "whatsapp_business"
    | "telegram"
    | "meta_graph";
}

// Réponse interne — jamais retournée au client directement
interface GetTokenInternalResponse {
  token: string;
  expires_at: string | null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Service role — accès Vault
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // Vérifier appelant authentifié
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Token invalide" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json() as GetTokenRequest;

    if (!body.user_id || !body.table || !body.token_type) {
      throw new Error("user_id, table, token_type requis");
    }

    // Sécurité : l'appelant ne peut lire que ses propres tokens
    if (user.id !== body.user_id) {
      return new Response(
        JSON.stringify({ error: "Interdit : user_id ne correspond pas" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Récupérer le secret_id depuis la table ---
    let secretId: string;
    let expiresAt: string | null = null;

    if (body.table === "closer_integrations") {
      if (!body.integration_type) throw new Error("integration_type requis");

      const { data, error } = await supabase
        .from("closer_integrations")
        .select("access_token_secret_id, refresh_token_secret_id, expires_at")
        .eq("closer_id", body.user_id)
        .eq("integration_type", body.integration_type)
        .eq("is_active", true)
        .single();

      if (error || !data) throw new Error(`Intégration introuvable: ${error?.message}`);

      secretId = body.token_type === "access"
        ? data.access_token_secret_id
        : data.refresh_token_secret_id;

      if (!secretId) throw new Error(`${body.token_type}_token_secret_id est null`);
      expiresAt = data.expires_at;

    } else {
      // google_calendar_tokens
      const { data, error } = await supabase
        .from("google_calendar_tokens")
        .select("access_token_secret_id, refresh_token_secret_id, expires_at")
        .eq("user_id", body.user_id)
        .single();

      if (error || !data) throw new Error(`Token GCal introuvable: ${error?.message}`);

      secretId = body.token_type === "access"
        ? data.access_token_secret_id
        : data.refresh_token_secret_id;

      expiresAt = data.expires_at;
    }

    // --- Déchiffrer just-in-time depuis Vault ---
    // Utilise service_role → accès vault.decrypted_secrets autorisé
    const { data: vaultData, error: vaultError } = await supabase
      .from("vault.decrypted_secrets")
      .select("decrypted_secret")
      .eq("id", secretId)
      .single();

    if (vaultError || !vaultData?.decrypted_secret) {
      throw new Error(`Déchiffrement Vault échoué: ${vaultError?.message}`);
    }

    const token = vaultData.decrypted_secret as string;

    // Log structuré SANS le token
    console.log(JSON.stringify({
      event: "token_accessed",
      table: body.table,
      token_type: body.token_type,
      user_id: body.user_id,
      ts: new Date().toISOString(),
    }));

    // Retourner le token déchiffré — UNIQUEMENT à une autre Edge Function (server-to-server)
    // NE PAS appeler cette fonction depuis le frontend
    const response: GetTokenInternalResponse = { token, expires_at: expiresAt };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Header de sécurité : empêche la mise en cache navigateur
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error(JSON.stringify({ event: "get_oauth_token_error", message, ts: new Date().toISOString() }));

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
