import { z } from 'zod';

export const callBookingSchema = z.object({
  // Identification
  firstName: z.string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  
  lastName: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  
  jobTitle: z.string()
    .trim()
    .min(2, "Le poste doit contenir au moins 2 caractères")
    .max(100, "Le poste ne peut pas dépasser 100 caractères"),
  
  companyName: z.string()
    .trim()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères")
    .max(100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères"),
  
  companyWebsite: z.string()
    .url("Veuillez entrer une URL valide")
    .optional()
    .or(z.literal('')),
  
  companyLinkedin: z.string()
    .url("Veuillez entrer une URL LinkedIn valide")
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .trim()
    .email("Veuillez entrer une adresse email valide")
    .refine((email) => {
      // Validation email professionnel (pas Gmail, Hotmail, Yahoo, etc.)
      const freeEmailDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com'];
      const domain = email.split('@')[1];
      return !freeEmailDomains.includes(domain);
    }, "Veuillez utiliser un email professionnel (@votre-entreprise.com)"),
  
  phone: z.string()
    .trim()
    .regex(/^[\d\s\+\-\(\)]+$/, "Numéro de téléphone invalide")
    .min(10, "Le numéro doit contenir au moins 10 chiffres"),
  
  // Données business
  industry: z.string()
    .min(1, "Veuillez sélectionner votre secteur d'activité"),
  
  annualRevenue: z.enum(['<100K', '100K-500K', '500K-1M', '>1M'], {
    errorMap: () => ({ message: "Veuillez sélectionner une tranche de CA" })
  }),
  
  salesTeamSize: z.coerce.number()
    .int()
    .min(0, "La taille de l'équipe doit être positive")
    .max(10000, "Valeur trop élevée"),
  
  currentChannels: z.array(z.string())
    .min(1, "Veuillez sélectionner au moins un canal"),
  
  mainChallenge: z.string()
    .trim()
    .min(10, "Décrivez votre défi principal (min 10 caractères)")
    .max(500, "Maximum 500 caractères"),
  
  // Intention et maturité
  callObjective: z.enum(['automate', 'train_closers', 'rethink_pipeline', 'other'], {
    errorMap: () => ({ message: "Veuillez sélectionner un objectif" })
  }),
  
  hasUsedAiCrm: z.enum(['yes', 'no', 'in_progress'], {
    errorMap: () => ({ message: "Veuillez répondre à cette question" })
  }),
  
  urgency: z.enum(['not_priority', 'within_month', 'this_week'], {
    errorMap: () => ({ message: "Veuillez indiquer votre urgence" })
  }),
  
  // Détails pratiques
  preferredDate: z.date({
    required_error: "Veuillez sélectionner une date",
  }).refine((date) => date > new Date(), {
    message: "La date doit être dans le futur",
  }),
  
  timezone: z.string().min(1, "Veuillez sélectionner votre fuseau horaire"),
  
  preferredPlatform: z.enum(['zoom', 'google_meet', 'whatsapp'], {
    errorMap: () => ({ message: "Veuillez sélectionner une plateforme" })
  }),
  
  // Engagement
  commitmentConfirmed: z.boolean().refine((val) => val === true, {
    message: "Vous devez confirmer votre engagement"
  }),
});

export type CallBookingFormData = z.infer<typeof callBookingSchema>;
