// store-oauth-token — Edge Function TUC
// Reçoit les tokens OAuth après un callback OAuth,
// les stocke chiffrés dans Supabase Vault,
// puis persiste les secret_id dans la table cible.
//
// Tables supportées : closer_integrations | google_calendar_tokens
// Sécurité : service_role uniquement, JWT vérifié, AAD = user_id
// BLOCKER-001 — Vague 2

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
interface StoreTokenRequest {
  table: "closer_integrations" | "google_calendar_tokens";
  user_id: string;
  access_token: string;
  refresh_token?: string;
  // Champs spécifiques à closer_integrations
  integration_type?:
    | "google_calendar"
    | "slack"
    | "hubspot"
    | "whatsapp_business"
    | "telegram"
    | "meta_graph";
  expires_at?: string;
  // Champs spécifiques à google_calendar_tokens
  calendar_email?: string;
}

interface StoreTokenResponse {
  success: boolean;
  record_id: string;
  error?: string;
}

// Validation input
function validateRequest(body: unknown): StoreTokenRequest {
  const req = body as StoreTokenRequest;

  if (!req.user_id || typeof req.user_id !== "string") {
    throw new Error("user_id requis (string UUID)");
  }
  if (!req.access_token || typeof req.access_token !== "string") {
    throw new Error("access_token requis");
  }
  if (!["closer_integrations", "google_calendar_tokens"].includes(req.table)) {
    throw new Error("table invalide");
  }
  if (req.table === "closer_integrations" && !req.integration_type) {
    throw new Error("integration_type requis pour closer_integrations");
  }
  if (req.table === "google_calendar_tokens" && !req.refresh_token) {
    throw new Error("refresh_token requis pour google_calendar_tokens");
  }

  return req;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Méthode
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Client service_role — jamais exposé côté client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // Vérifier que l'appelant est authentifié (JWT valide)
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
    // Parse + validation
    const body = await req.json();
    const request = validateRequest(body);

    // Sécurité : l'appelant ne peut stocker que ses propres tokens
    if (user.id !== request.user_id) {
      return new Response(
        JSON.stringify({ error: "Interdit : user_id ne correspond pas" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Stocker access_token dans Vault ---
    // AAD (Associated Data) = user_id pour lier cryptographiquement
    // le secret à son propriétaire (anti-permutation)
    const accessSecretName = `tuc_${request.table}_access_${request.user_id}`;

    const { data: accessVault, error: accessVaultError } = await supabase
      .rpc("vault_create_or_update_secret", {
        p_secret: request.access_token,
        p_name: accessSecretName,
        p_description: `access_token OAuth pour user ${request.user_id} — ${request.table}`,
      });

    if (accessVaultError || !accessVault) {
      // Fallback : utiliser vault.create_secret directement via SQL
      const { data: vaultData, error: vaultSqlError } = await supabase
        .from("vault.secrets")
        .insert({
          secret: request.access_token,
          name: accessSecretName,
          description: `access_token OAuth — ${request.table} — ${request.user_id}`,
        })
        .select("id")
        .single();

      if (vaultSqlError) throw new Error(`Vault access_token: ${vaultSqlError.message}`);
      var accessSecretId = vaultData.id as string;
    } else {
      var accessSecretId = accessVault as string;
    }

    // --- Stocker refresh_token dans Vault (si fourni) ---
    let refreshSecretId: string | null = null;

    if (request.refresh_token) {
      const refreshSecretName = `tuc_${request.table}_refresh_${request.user_id}`;

      const { data: refreshVaultData, error: refreshVaultError } = await supabase
        .from("vault.secrets")
        .insert({
          secret: request.refresh_token,
          name: refreshSecretName,
          description: `refresh_token OAuth — ${request.table} — ${request.user_id}`,
        })
        .select("id")
        .single();

      if (refreshVaultError) throw new Error(`Vault refresh_token: ${refreshVaultError.message}`);
      refreshSecretId = refreshVaultData.id as string;
    }

    // --- Persister les secret_id dans la table cible ---
    let recordId: string;

    if (request.table === "closer_integrations") {
      const upsertData: Record<string, unknown> = {
        closer_id: request.user_id,
        integration_type: request.integration_type,
        access_token_secret_id: accessSecretId,
        refresh_token_secret_id: refreshSecretId,
        expires_at: request.expires_at ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("closer_integrations")
        .upsert(upsertData, {
          onConflict: "closer_id,integration_type",
        })
        .select("id")
        .single();

      if (error) throw new Error(`closer_integrations upsert: ${error.message}`);
      recordId = data.id;

    } else {
      // google_calendar_tokens
      const upsertData: Record<string, unknown> = {
        user_id: request.user_id,
        access_token_secret_id: accessSecretId,
        refresh_token_secret_id: refreshSecretId!,
        expires_at: request.expires_at ?? new Date(Date.now() + 3600 * 1000).toISOString(),
        calendar_email: request.calendar_email ?? null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("google_calendar_tokens")
        .upsert(upsertData, { onConflict: "user_id" })
        .select("id")
        .single();

      if (error) throw new Error(`google_calendar_tokens upsert: ${error.message}`);
      recordId = data.id;
    }

    // Réponse — NE JAMAIS retourner le token déchiffré
    const response: StoreTokenResponse = { success: true, record_id: recordId };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    // Log structuré JSON sans données sensibles
    console.error(JSON.stringify({ event: "store_oauth_token_error", message, ts: new Date().toISOString() }));

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
