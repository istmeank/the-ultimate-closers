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
    const { dealId, amount } = await req.json();
    
    console.log(`Stripe checkout requested: Deal ${dealId}, Amount: ${amount}`);
    
    // TODO: Implémenter la vraie session Stripe
    // const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    // if (!stripeKey) {
    //   throw new Error('STRIPE_SECRET_KEY not configured');
    // }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Récupérer les infos du deal
    const { data: deal, error } = await supabaseClient
      .from('deals')
      .select('*, leads(*)')
      .eq('id', dealId)
      .single();
    
    if (error) throw error;
    
    console.log(`Would create Stripe checkout for deal ${dealId} (${amount} EUR)`);
    
    // TODO: Créer une vraie session Stripe
    // const stripe = new Stripe(stripeKey);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'eur',
    //       product_data: {
    //         name: deal.offer_name,
    //       },
    //       unit_amount: amount * 100,
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${req.headers.get('origin')}/success?deal_id=${dealId}`,
    //   cancel_url: `${req.headers.get('origin')}/cancel`,
    //   customer_email: deal.leads.email,
    // });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Paiement Stripe en cours (mode stub)',
        checkoutUrl: 'https://checkout.stripe.com/demo',
        dealId,
        amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
