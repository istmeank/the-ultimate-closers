// Edge Function sécurisée pour les analytics
// Remplace l'accès direct à site_analytics avec validation et rate limiting

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

    // Récupérer les données de la requête
    const analyticsData = await req.json()

    // VALIDATION STRICTE
    const validationErrors = validateAnalyticsData(analyticsData)
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: validationErrors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // RATE LIMITING par IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const isRateLimited = await checkAnalyticsRateLimit(supabase, clientIP)
    
    if (isRateLimited) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Trop de requêtes analytics. Veuillez patienter.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // SANITISATION des données
    const sanitizedData = sanitizeAnalyticsData(analyticsData)

    // INSERTION sécurisée dans la base de données
    const { data, error } = await supabase
      .from('site_analytics')
      .insert([{
        ...sanitizedData,
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent') || 'unknown',
        submission_source: 'edge_function',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erreur lors de la sauvegarde analytics.' 
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
        analyticsId: data.id,
        message: 'Analytics event enregistré avec succès' 
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
        error: 'Erreur interne du serveur' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Fonction de validation stricte pour analytics
function validateAnalyticsData(data: any): string[] {
  const errors: string[] = []

  // Validation des champs obligatoires
  const requiredFields = ['event_type', 'page_path']
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim().length === 0) {
      errors.push(`Le champ ${field} est obligatoire`)
    }
  }

  // Validation event_type
  const validEventTypes = ['page_view', 'click', 'form_submit', 'download', 'custom']
  if (data.event_type && !validEventTypes.includes(data.event_type)) {
    errors.push('Type d\'événement invalide')
  }

  // Validation page_path
  if (data.page_path && data.page_path.length > 500) {
    errors.push('Le chemin de page est trop long (max 500 caractères)')
  }

  // Validation metadata (si présent)
  if (data.metadata && typeof data.metadata !== 'object') {
    errors.push('Les métadonnées doivent être un objet JSON')
  }

  return errors
}

// Fonction de rate limiting pour analytics
async function checkAnalyticsRateLimit(supabase: any, ip: string): Promise<boolean> {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

  // Vérifier par IP (max 100 événements/minute)
  const { count: ipCount } = await supabase
    .from('site_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', oneMinuteAgo.toISOString())

  if (ipCount && ipCount >= 100) {
    return true
  }

  return false
}

// Fonction de sanitisation pour analytics
function sanitizeAnalyticsData(data: any): any {
  return {
    event_type: data.event_type?.toString().trim(),
    page_path: data.page_path?.toString().trim(),
    user_id: data.user_id || null,
    metadata: data.metadata || {},
    session_id: data.session_id || null,
    referrer: data.referrer?.toString().trim() || null,
    language: data.language || 'fr'
  }
}
