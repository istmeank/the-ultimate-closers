import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  score: number;
  source: string;
  status: string;
  interest: string | null;
}

const getHubSpotApiUrl = (apiKey: string): string => {
  // HubSpot uses the same API URL for all regions (US and EU)
  // The routing is handled automatically based on the token prefix
  return 'https://api.hubapi.com';
};

const mapStatusToLifecycleStage = (status: string): string => {
  const mapping: Record<string, string> = {
    'new': 'lead',
    'qualified': 'marketingqualifiedlead',
    'in_progress': 'salesqualifiedlead',
    'won': 'customer',
    'lost': 'other',
  };
  return mapping[status] || 'lead';
};

const getHubSpotApiKey = async (supabaseClient: any, userId?: string): Promise<string> => {
  if (!userId) {
    const apiKey = Deno.env.get('HUBSPOT_API_KEY');
    if (!apiKey) throw new Error('HUBSPOT_API_KEY not configured');
    return apiKey;
  }

  const { data, error } = await supabaseClient
    .from('closer_integrations')
    .select('access_token')
    .eq('closer_id', userId)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data?.access_token) {
    throw new Error('HubSpot integration not configured for this user');
  }

  return data.access_token;
};

const searchContactByEmail = async (email: string, apiKey: string): Promise<string | null> => {
  try {
    const apiUrl = getHubSpotApiUrl(apiKey);
    const response = await fetch(`${apiUrl}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email,
          }],
        }],
        properties: ['email'],
        limit: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.results?.[0]?.id || null;
  } catch (error) {
    console.error('Error searching contact:', error);
    return null;
  }
};

const createOrUpdateContact = async (lead: Lead, apiKey: string): Promise<{ id: string; action: 'created' | 'updated' }> => {
  const apiUrl = getHubSpotApiUrl(apiKey);
  const nameParts = lead.full_name.trim().split(' ');
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';

  const properties = {
    email: lead.email,
    firstname,
    lastname,
    phone: lead.phone || '',
    lifecyclestage: mapStatusToLifecycleStage(lead.status),
    hs_lead_status: lead.status,
  };

  // Search for existing contact
  const existingContactId = await searchContactByEmail(lead.email, apiKey);

  if (existingContactId) {
    // Update existing contact
    const response = await fetch(`${apiUrl}/crm/v3/objects/contacts/${existingContactId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update contact: ${error}`);
    }

    return { id: existingContactId, action: 'updated' };
  } else {
    // Create new contact
    const response = await fetch(`${apiUrl}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create contact: ${error}`);
    }

    const data = await response.json();
    return { id: data.id, action: 'created' };
  }
};

const logSync = async (
  supabaseClient: any,
  leadId: string,
  status: 'success' | 'error',
  hubspotId: string | null = null,
  error: string | null = null
) => {
  await supabaseClient
    .from('external_sync_log')
    .upsert({
      entity_type: 'lead',
      entity_id: leadId,
      status,
      hubspot_id: hubspotId,
      error,
      last_sync: new Date().toISOString(),
    }, {
      onConflict: 'entity_type,entity_id',
    });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let userId: string | undefined;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    const { leadId, action, apiKey: providedApiKey } = await req.json();
    console.log(`HubSpot sync: Action=${action}, Lead=${leadId || 'N/A'}`);

    // Test connection action
    if (action === 'test_connection') {
      if (!providedApiKey) {
        throw new Error('API key required for testing');
      }

      const apiUrl = getHubSpotApiUrl(providedApiKey);
      const response = await fetch(`${apiUrl}/crm/v3/objects/contacts?limit=1`, {
        headers: {
          'Authorization': `Bearer ${providedApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HubSpot API error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Clé API invalide. Vérifiez que vous avez copié la clé complète depuis HubSpot.');
        } else if (response.status === 403) {
          throw new Error('Permissions insuffisantes. Votre clé API doit avoir le scope "crm.objects.contacts.write" pour créer et modifier des contacts.');
        } else {
          throw new Error(`Erreur HubSpot (${response.status}): ${errorText}`);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = providedApiKey || await getHubSpotApiKey(supabaseClient, userId);

    // Sync single lead
    if (action === 'create' || action === 'update') {
      if (!leadId) throw new Error('leadId required');

      const { data: lead, error: leadError } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      try {
        const result = await createOrUpdateContact(lead, apiKey);
        await logSync(supabaseClient, leadId, 'success', result.id);

        console.log(`Lead ${leadId} ${result.action} in HubSpot: ${result.id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            hubspotId: result.id,
            action: result.action,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await logSync(supabaseClient, leadId, 'error', null, errorMessage);
        throw error;
      }
    }

    // Sync all qualified leads
    if (action === 'sync_all') {
      const { data: leads, error: leadsError } = await supabaseClient
        .from('leads')
        .select('*')
        .gte('score', 75)
        .in('status', ['new', 'qualified', 'in_progress']);

      if (leadsError) throw leadsError;

      let synced = 0;
      let failed = 0;

      for (const lead of leads) {
        try {
          const result = await createOrUpdateContact(lead, apiKey);
          await logSync(supabaseClient, lead.id, 'success', result.id);
          synced++;
          console.log(`Lead ${lead.id} synced: ${result.action}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await logSync(supabaseClient, lead.id, 'error', null, errorMessage);
          failed++;
          console.error(`Failed to sync lead ${lead.id}:`, errorMessage);
        }

        // Rate limiting: 100 requests per 10 seconds
        if ((synced + failed) % 90 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          synced,
          failed,
          total: leads.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
    
  } catch (error) {
    console.error('HubSpot sync error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
