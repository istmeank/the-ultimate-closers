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
    console.log('🔍 Delete user request received');
    console.log('📋 Request method:', req.method);
    console.log('📋 All headers:', Object.fromEntries(req.headers.entries()));
    
    // Vérifier le header Authorization
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Authorization header present:', !!authHeader);
    if (authHeader) {
      console.log('🔐 Token preview:', authHeader.substring(0, 30) + '...');
    }
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header manquant' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Créer un client avec le token de l'utilisateur pour vérifier l'authentification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    console.log('Auth error:', authError);
    console.log('User authenticated:', !!user);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé', details: authError?.message }), 
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
        JSON.stringify({ error: 'Interdit: Seuls les admins et owners peuvent supprimer des utilisateurs' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Récupérer l'ID de l'utilisateur à supprimer
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId requis' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Empêcher la suppression de son propre compte
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Vous ne pouvez pas supprimer votre propre compte' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur à supprimer n'est pas un owner
    const { data: targetRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    const isTargetOwner = targetRoles?.some(r => r.role === 'owner');
    if (isTargetOwner) {
      return new Response(
        JSON.stringify({ error: 'Impossible de supprimer un owner' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Tenter la suppression de l'utilisateur d'auth puis nettoyer les données applicatives
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.log('⚠️ admin.deleteUser error:', deleteError.message);
      // Si l'utilisateur n'existe pas côté auth, on continue le nettoyage applicatif
      if (!deleteError.message?.toLowerCase().includes('user not found')) {
        return new Response(
          JSON.stringify({ error: `Erreur lors de la suppression: ${deleteError.message}` }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Nettoyage des données applicatives
    const { error: rolesDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    if (rolesDeleteError) {
      console.log('⚠️ user_roles delete error:', rolesDeleteError.message);
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileDeleteError) {
      console.log('⚠️ profiles delete error:', profileDeleteError.message);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Utilisateur supprimé avec succès' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const e = err as { message?: string };
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Erreur inattendue' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
