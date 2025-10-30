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
    const { leadData } = await req.json();
    
    console.log('Scoring lead:', leadData.email);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Calcul du score (0-100)
    let score = 0;
    
    // Revenue (+30 points)
    const revenueMap: Record<string, number> = {
      '>1M': 30,
      '500K-1M': 25,
      '100K-500K': 15,
      '<100K': 5
    };
    score += revenueMap[leadData.annual_revenue] || 0;
    
    // Urgence (+20 points)
    const urgencyMap: Record<string, number> = {
      'asap': 20,
      'this_month': 15,
      'not_priority': 5
    };
    score += urgencyMap[leadData.urgency] || 0;
    
    // Email business (+15 points)
    if (leadData.is_business_email) score += 15;
    
    // Équipe commerciale (+10 points si >= 5 personnes)
    if (leadData.sales_team_size && leadData.sales_team_size >= 5) score += 10;
    
    // Objectif clair (+10 points)
    if (leadData.call_objective !== 'other') score += 10;
    
    // LinkedIn (+5 points)
    if (leadData.company_linkedin) score += 5;
    
    // Engagement (+10 points si commitment confirmé)
    if (leadData.commitment_confirmed) score += 10;
    
    console.log(`Lead score calculated: ${score}/100`);
    
    // Créer ou update lead avec score
    // Le trigger auto_assign_closer_to_lead() s'exécutera automatiquement
    const { data: lead, error } = await supabaseClient
      .from('leads')
      .upsert({
        email: leadData.email,
        full_name: `${leadData.first_name} ${leadData.last_name}`,
        phone: leadData.phone,
        source: leadData.source || 'chatbot',
        interest: leadData.main_challenge,
        score: score,
        status: score >= 75 ? 'qualified' : 'new'
      }, {
        onConflict: 'email'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating/updating lead:', error);
      throw error;
    }
    
    console.log(`Lead ${lead.id} created/updated. Assigned to: ${lead.owner_id || 'None (score < 75)'}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        score, 
        lead,
        auto_assigned: !!lead.owner_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Score lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
