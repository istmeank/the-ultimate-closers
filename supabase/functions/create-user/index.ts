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
    
    // Créer l'utilisateur
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' }
    });
    
    if (createError) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création: ${createError.message}` }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Créer le profil
    await supabaseAdmin.from('profiles').insert({
      id: newUser.user.id,
      email: email,
      full_name: fullName || ''
    });
    
    // Assigner les rôles
    if (selectedRoles && Array.isArray(selectedRoles)) {
      for (const role of selectedRoles) {
        if (['admin', 'closer', 'user'].includes(role)) {
          await supabaseAdmin.from('user_roles').insert({
            user_id: newUser.user.id,
            role: role
          });
        }
      }
    } else {
      // Rôle par défaut: user
      await supabaseAdmin.from('user_roles').insert({
        user_id: newUser.user.id,
        role: 'user'
      });
    }
    
    return new Response(
      JSON.stringify({ success: true, user: newUser.user }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
