import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, action } = await req.json();
    
    console.log(`HubSpot sync requested: Lead ${leadId}, Action: ${action}`);
    
    // TODO: Implémenter la vraie sync avec HubSpot API
    // const hubspotToken = Deno.env.get('HUBSPOT_API_KEY');
    // if (!hubspotToken) {
    //   throw new Error('HUBSPOT_API_KEY not configured');
    // }
    
    // Stub: Simuler la synchronisation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Récupérer les données du lead
    const { data: lead, error } = await supabaseClient
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (error) throw error;
    
    console.log(`Would sync lead ${lead.email} to HubSpot (action: ${action})`);
    
    // TODO: Faire l'appel API réel à HubSpot
    // await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${hubspotToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     properties: {
    //       email: lead.email,
    //       firstname: lead.full_name.split(' ')[0],
    //       lastname: lead.full_name.split(' ')[1],
    //       phone: lead.phone,
    //     }
    //   })
    // });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'HubSpot sync simulée (mode stub)',
        leadId,
        action,
        leadEmail: lead.email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('HubSpot sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
