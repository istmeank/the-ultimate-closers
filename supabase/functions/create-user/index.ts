import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Vérifier que l'appelant est authentifié
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier que l'utilisateur a le rôle admin ou owner
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasPermission = roles?.some(r => ['admin', 'owner'].includes(r.role));
    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Seuls les admins et owners peuvent créer des utilisateurs' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Récupérer les données de la requête
    const { email, password, fullName, roles: selectedRoles } = await req.json();
    
    // Valider l'email
    if (!email || !email.endsWith('@theultimateclosers.com')) {
      return new Response(
        JSON.stringify({ error: 'Email invalide. Seuls les emails @theultimateclosers.com sont autorisés.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Valider le mot de passe
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Créer l'utilisateur (idempotent)
    let userId: string | null = null;
    let existed = false;
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' }
    });

    if (createError) {
      const msg = createError.message?.toLowerCase() || '';
      const already = msg.includes('already been registered') || msg.includes('already registered') || msg.includes('user already') || msg.includes('exists');
      if (!already) {
        return new Response(
          JSON.stringify({ error: `Erreur lors de la création: ${createError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      existed = true;
      // Chercher l'utilisateur existant par le profil
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile?.id) {
        userId = existingProfile.id;
      } else {
        // Fallback: parcourir la liste des utilisateurs Auth
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const found = usersList?.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
        if (!found) {
          return new Response(
            JSON.stringify({ error: 'Utilisateur déjà existant mais introuvable' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        userId = found.id;
      }
    } else {
      userId = newUser.user.id;
    }

    // Assurer le profil (upsert)
    await supabaseAdmin.from('profiles').upsert(
      { id: userId, email, full_name: fullName || '' },
      { onConflict: 'id' }
    );

    // Assigner les rôles (upsert pour éviter les doublons)
    const rolesToAssign = (selectedRoles && Array.isArray(selectedRoles) && selectedRoles.length > 0)
      ? selectedRoles
      : ['user'];
    const validRoles = ['admin', 'closer', 'user'];
    const roleRows = rolesToAssign
      .filter((r: string) => validRoles.includes(r))
      .map((r: string) => ({ user_id: userId as string, role: r }));

    if (roleRows.length > 0) {
      await supabaseAdmin.from('user_roles').upsert(roleRows, { onConflict: 'user_id,role' });
    }
    
    const responseUser = existed ? { id: userId, email, full_name: fullName || null, existed: true } : newUser.user;
    return new Response(
      JSON.stringify({ success: true, user: responseUser, existed }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const e = err as { message?: string };
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Unexpected error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
