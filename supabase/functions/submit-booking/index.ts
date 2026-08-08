import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Submit Booking function started');

interface RateLimitCheck {
  email: string;
  ip: string;
}

async function checkRateLimit(
  supabase: any,
  { email, ip }: RateLimitCheck
): Promise<{ allowed: boolean; message?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Check email rate limit (3 per hour)
  const { data: emailAttempts, error: emailError } = await supabase
    .from('call_bookings')
    .select('id')
    .eq('email', email)
    .gte('created_at', oneHourAgo);

  if (emailError) {
    console.error('Email rate limit check error:', emailError);
  } else if (emailAttempts && emailAttempts.length >= 3) {
    return { 
      allowed: false, 
      message: 'Trop de tentatives depuis cette adresse email. Veuillez réessayer dans 1 heure.' 
    };
  }

  // Check IP rate limit (5 per hour)
  const { data: ipAttempts, error: ipError } = await supabase
    .from('call_bookings')
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo);

  if (ipError) {
    console.error('IP rate limit check error:', ipError);
  } else if (ipAttempts && ipAttempts.length >= 5) {
    return { 
      allowed: false, 
      message: 'Trop de tentatives depuis cette adresse IP. Veuillez réessayer dans 1 heure.' 
    };
  }

  // Check for existing booking in last 7 days
  const { data: existingBooking, error: existingError } = await supabase
    .from('call_bookings')
    .select('id')
    .eq('email', email)
    .neq('status', 'cancelled')
    .gte('created_at', sevenDaysAgo)
    .limit(1);

  if (existingError) {
    console.error('Existing booking check error:', existingError);
  } else if (existingBooking && existingBooking.length > 0) {
    return { 
      allowed: false, 
      message: 'Vous avez déjà une réservation en cours. Veuillez patienter 7 jours avant de réserver à nouveau.' 
    };
  }

  // Check total recent bookings (spam detection - 10 in 10 minutes)
  const { data: recentBookings, error: recentError } = await supabase
    .from('call_bookings')
    .select('id')
    .gte('created_at', tenMinutesAgo);

  if (recentError) {
    console.error('Recent bookings check error:', recentError);
  } else if (recentBookings && recentBookings.length >= 10) {
    return { 
      allowed: false, 
      message: 'Système temporairement surchargé. Veuillez réessayer dans quelques minutes.' 
    };
  }

  return { allowed: true };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingData, turnstileToken } = await req.json();
    
    // Get real IP address
    const realIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                   req.headers.get('x-real-ip') ||
                   req.headers.get('cf-connecting-ip') ||
                   'unknown';
    
    console.log('Processing booking from IP:', realIp);

    // Verify Turnstile token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/verify-turnstile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: turnstileToken,
        ip: realIp 
      }),
    });

    const verifyResult = await verifyResponse.json();
    
    if (!verifyResult.success) {
      console.error('Turnstile verification failed:', verifyResult.error_codes);
      return new Response(
        JSON.stringify({ 
          error: 'Vérification de sécurité échouée. Veuillez réessayer.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Turnstile verification successful');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limits
    const rateLimitCheck = await checkRateLimit(supabaseClient, {
      email: bookingData.email,
      ip: realIp,
    });

    if (!rateLimitCheck.allowed) {
      console.log('Rate limit exceeded:', rateLimitCheck.message);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Rate limits passed, inserting booking...');

    // Insert booking with captured IP and user agent
    const { data, error } = await supabaseClient
      .from('call_bookings')
      .insert({
        ...bookingData,
        ip_address: realIp,
        user_agent: req.headers.get('user-agent') || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Booking insertion error:', error);
      throw error;
    }

    console.log('Booking created successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Submit booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la réservation';
    return new Response(
      JSON.stringify({ 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
