// Edge Function pour corriger la sécurité call_bookings
// À déployer via Lovable Cloud si possible

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer client Supabase avec service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Script SQL de correction
    const securityFixSQL = `
      -- Supprimer policies existantes
      DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
      DROP POLICY IF EXISTS "Admins can view all bookings" ON public.call_bookings;
      DROP POLICY IF EXISTS "Admins can update bookings" ON public.call_bookings;

      -- Activer RLS
      ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

      -- Créer policies sécurisées
      CREATE POLICY "secure_create_booking"
      ON public.call_bookings FOR INSERT
      TO authenticated
      WITH CHECK (true);

      CREATE POLICY "secure_view_bookings"
      ON public.call_bookings FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::app_role));

      CREATE POLICY "secure_update_bookings"
      ON public.call_bookings FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

      CREATE POLICY "secure_delete_bookings"
      ON public.call_bookings FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::app_role));
    `

    // Exécuter le script
    const { error } = await supabase.rpc('exec_sql', { sql: securityFixSQL })

    if (error) {
      console.error('Error applying security fix:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Security fix applied successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
