// Edge Function sécurisée pour les réservations d'appels
// Remplace l'accès direct à la base de données avec validation et rate limiting

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
    const bookingData = await req.json()

    // VALIDATION STRICTE
    const validationErrors = validateBookingData(bookingData)
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
    const isRateLimited = await checkRateLimit(supabase, clientIP, bookingData.email)
    
    if (isRateLimited) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Trop de tentatives. Veuillez patienter avant de réessayer.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // SANITISATION des données
    const sanitizedData = sanitizeBookingData(bookingData)

    // VÉRIFICATION anti-spam (email déjà utilisé récemment)
    const existingBooking = await supabase
      .from('call_bookings')
      .select('id, created_at')
      .eq('email', sanitizedData.email)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .neq('status', 'cancelled')
      .maybeSingle()

    if (existingBooking.data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Vous avez déjà une réservation en cours. Veuillez patienter 7 jours avant de réserver à nouveau.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // INSERTION sécurisée dans la base de données
    const { data, error } = await supabase
      .from('call_bookings')
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
          error: 'Erreur lors de la sauvegarde. Veuillez réessayer.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // LOG de sécurité
    await supabase
      .from('external_sync_log')
      .insert({
        entity_type: 'call_booking',
        entity_id: data.id,
        status: 'success',
        details: {
          ip: clientIP,
          user_agent: req.headers.get('user-agent'),
          source: 'edge_function'
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: data.id,
        message: 'Réservation créée avec succès' 
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

// Fonction de validation stricte
function validateBookingData(data: any): string[] {
  const errors: string[] = []

  // Validation des champs obligatoires
  const requiredFields = [
    'first_name', 'last_name', 'email', 'phone', 'company_name',
    'industry', 'annual_revenue', 'main_challenge', 'call_objective',
    'has_used_ai_crm', 'urgency', 'timezone', 'preferred_platform'
  ]

  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim().length === 0) {
      errors.push(`Le champ ${field} est obligatoire`)
    }
  }

  // Validation email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Format d\'email invalide')
  }

  // Validation téléphone
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.push('Format de téléphone invalide')
  }

  // Validation longueurs
  if (data.first_name && (data.first_name.length < 2 || data.first_name.length > 50)) {
    errors.push('Le prénom doit contenir entre 2 et 50 caractères')
  }

  if (data.last_name && (data.last_name.length < 2 || data.last_name.length > 50)) {
    errors.push('Le nom doit contenir entre 2 et 50 caractères')
  }

  if (data.company_name && (data.company_name.length < 2 || data.company_name.length > 100)) {
    errors.push('Le nom de l\'entreprise doit contenir entre 2 et 100 caractères')
  }

  // Validation des valeurs enum
  const validUrgency = ['urgent', 'this_week', 'this_month', 'flexible']
  if (data.urgency && !validUrgency.includes(data.urgency)) {
    errors.push('Valeur de délai invalide')
  }

  const validPlatform = ['zoom', 'teams', 'google_meet', 'phone']
  if (data.preferred_platform && !validPlatform.includes(data.preferred_platform)) {
    errors.push('Plateforme de communication invalide')
  }

  return errors
}

// Fonction de rate limiting
async function checkRateLimit(supabase: any, ip: string, email: string): Promise<boolean> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Vérifier par IP (max 5 tentatives/heure)
  const { count: ipCount } = await supabase
    .from('call_bookings')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo.toISOString())

  if (ipCount && ipCount >= 5) {
    return true
  }

  // Vérifier par email (max 3 tentatives/heure)
  const { count: emailCount } = await supabase
    .from('call_bookings')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneHourAgo.toISOString())

  if (emailCount && emailCount >= 3) {
    return true
  }

  return false
}

// Fonction de sanitisation
function sanitizeBookingData(data: any): any {
  return {
    first_name: data.first_name?.toString().trim(),
    last_name: data.last_name?.toString().trim(),
    job_title: data.job_title?.toString().trim(),
    company_name: data.company_name?.toString().trim(),
    company_website: data.company_website?.toString().trim(),
    company_linkedin: data.company_linkedin?.toString().trim(),
    email: data.email?.toString().trim().toLowerCase(),
    phone: data.phone?.toString().trim(),
    industry: data.industry?.toString().trim(),
    annual_revenue: data.annual_revenue?.toString().trim(),
    sales_team_size: parseInt(data.sales_team_size) || null,
    current_channels: data.current_channels || [],
    main_challenge: data.main_challenge?.toString().trim(),
    call_objective: data.call_objective?.toString().trim(),
    has_used_ai_crm: data.has_used_ai_crm?.toString().trim(),
    urgency: data.urgency?.toString().trim(),
    preferred_date: data.preferred_date || null,
    timezone: data.timezone?.toString().trim(),
    preferred_platform: data.preferred_platform?.toString().trim(),
    commitment_confirmed: Boolean(data.commitment_confirmed),
    language: data.language || 'fr'
  }
}
