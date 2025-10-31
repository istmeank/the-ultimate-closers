import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId } = await req.json();

    if (!appointmentId) {
      throw new Error('appointmentId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointment details with lead info
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select(`
        *,
        leads!inner(full_name, email, phone)
      `)
      .eq('id', appointmentId)
      .single();

    if (aptError || !appointment) {
      console.error('Appointment not found:', aptError);
      throw new Error('Appointment not found');
    }

    const { assigned_to, start_at, end_at, leads } = appointment;
    const lead = Array.isArray(leads) ? leads[0] : leads;

    // Get closer's Google Calendar integration
    const { data: integration, error: intError } = await supabase
      .from('closer_integrations')
      .select('*')
      .eq('closer_id', assigned_to)
      .eq('integration_type', 'google_calendar')
      .eq('is_active', true)
      .single();

    if (intError || !integration) {
      console.log('No active Google Calendar integration found for closer:', assigned_to);
      return new Response(
        JSON.stringify({ success: false, message: 'No integration found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let accessToken = integration.access_token;

    // Check if token is expired
    const expiresAt = new Date(integration.expires_at);
    if (expiresAt <= new Date()) {
      console.log('Access token expired, refreshing...');
      
      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured');
      }

      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        const error = await refreshResponse.text();
        console.error('Token refresh failed:', error);
        throw new Error('Failed to refresh access token');
      }

      const tokens = await refreshResponse.json();
      accessToken = tokens.access_token;

      // Update stored token
      const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
      await supabase
        .from('closer_integrations')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
        })
        .eq('id', integration.id);
    }

    // Create Google Calendar event
    const event = {
      summary: `Rendez-vous avec ${lead.full_name}`,
      description: `Contact: ${lead.email}${lead.phone ? ` - ${lead.phone}` : ''}`,
      start: {
        dateTime: start_at,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: end_at,
        timeZone: 'Europe/Paris',
      },
    };

    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error('Failed to create calendar event:', error);
      throw new Error('Failed to create calendar event');
    }

    const calendarEvent = await calendarResponse.json();

    // Update appointment with gcal_event_id
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ gcal_event_id: calendarEvent.id })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment with gcal_event_id:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, eventId: calendarEvent.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
