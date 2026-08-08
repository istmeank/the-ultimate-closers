# 🎨 Prompt Gemini - The Ultimate Closers
## Documentation Complète du Projet avec Charte Graphique

---

## 📋 Vue d'Ensemble du Projet

**The Ultimate Closers** est une plateforme SaaS CRM complète dédiée aux équipes de vente (closers) avec intégration d'un LLM propriétaire appelé **Proton ANK**. Le projet fusionne psychologie, intelligence artificielle et éthique pour réinventer la vente avec conscience.

### Mission
"Convert without pressure. Perform with conscience." - Convertir sans pression. Performer avec conscience.

### Concept Clé
Une agence de closing éthique alimentée par l'IA, construite sur la psychologie, la stratégie et la valeur humaine. Le slogan emblématique : **"Closing is Art - Not Tbla3it"** (Le closing est un art, pas du bavardage).

---

## 🏗️ Architecture Technique

### Stack Frontend
- **Framework**: React 18 avec TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4+ avec système de design personnalisé
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM v6
- **State Management**: 
  - React Query (TanStack Query) pour les données serveur
  - Context API pour le thème et les langues
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Management**: React Hook Form + Zod validation

### Stack Backend
- **API**: FastAPI (Python) pour Proton ANK
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Edge Functions**: Supabase Functions (TypeScript)
- **LLM**: Nemotron H 8B Reasoning (Proton ANK)

### Dépendances Principales
```json
{
  "@supabase/supabase-js": "^2.75.1",
  "@tanstack/react-query": "^5.83.0",
  "framer-motion": "^12.23.24",
  "react-router-dom": "^6.30.1",
  "lucide-react": "^0.462.0",
  "next-themes": "^0.3.0",
  "tailwindcss": "^3.4.17"
}
```

---

## 🎨 CHARTE GRAPHIQUE EXACTE

### 🎨 Système de Couleurs

#### Mode Clair (Light Mode)

**Couleurs Principales:**
- **Background**: `hsl(44, 30%, 95%)` - Beige clair chaud
- **Foreground**: `hsl(167, 69%, 18%)` - Vert malachite foncé (texte principal)

**Primary (Or Doré):**
- **Primary**: `hsl(44, 73%, 66%)` - Or doré chaud
- **Primary Foreground**: `hsl(167, 69%, 18%)` - Vert malachite foncé
- **Primary Glow**: `hsl(44, 100%, 75%)` - Or brillant pour effets lumineux

**Secondary (Vert Malachite):**
- **Secondary**: `hsl(167, 69%, 18%)` - Vert malachite foncé
- **Secondary Foreground**: `hsl(0, 0%, 98%)` - Blanc cassé

**Accent (Violet IA):**
- **Accent**: `hsl(271, 91%, 65%)` - Violet magenta pour éléments IA
- **Accent Foreground**: `hsl(0, 0%, 98%)` - Blanc cassé

**Or Spécial (Gold):**
- **Gold**: `hsl(44, 73%, 66%)` - Or doré
- **Gold Glow**: `hsl(44, 100%, 75%)` - Or brillant pour effets

**Neutres:**
- **Muted**: `hsl(0, 0%, 93%)` - Gris très clair
- **Muted Foreground**: `hsl(0, 0%, 45%)` - Gris moyen
- **Border**: `hsl(167, 20%, 85%)` - Vert très pâle
- **Input**: `hsl(167, 20%, 85%)` - Vert très pâle
- **Ring**: `hsl(44, 73%, 66%)` - Or doré (focus)

**Destructive:**
- **Destructive**: `hsl(0, 84.2%, 60.2%)` - Rouge
- **Destructive Foreground**: `hsl(0, 0%, 98%)` - Blanc cassé

#### Mode Sombre (Dark Mode)

**Couleurs Principales:**
- **Background**: `hsl(0, 0%, 7%)` - Noir profond
- **Foreground**: `hsl(0, 0%, 98%)` - Blanc cassé

**Primary:**
- **Primary**: `hsl(167, 69%, 18%)` - Vert malachite foncé
- **Primary Foreground**: `hsl(0, 0%, 98%)` - Blanc cassé

**Secondary:**
- **Secondary**: `hsl(44, 73%, 66%)` - Or doré (inversé en dark)
- **Secondary Foreground**: `hsl(167, 69%, 18%)` - Vert malachite foncé

**Accent:**
- **Accent**: `hsl(271, 91%, 65%)` - Violet magenta (identique)
- **Accent Foreground**: `hsl(0, 0%, 98%)` - Blanc cassé

**Neutres Dark:**
- **Muted**: `hsl(0, 0%, 15%)` - Gris très foncé
- **Muted Foreground**: `hsl(0, 0%, 65%)` - Gris clair
- **Border**: `hsl(0, 0%, 20%)` - Gris foncé
- **Input**: `hsl(0, 0%, 20%)` - Gris foncé
- **Ring**: `hsl(44, 73%, 66%)` - Or doré (focus)

### 🌈 Dégradés (Gradients)

**Gradient Cosmic:**
```css
linear-gradient(135deg, hsl(167, 69%, 18%), hsl(167, 69%, 12%))
```
- Utilisé pour les sections hero avec fond sombre

**Gradient Gold:**
```css
linear-gradient(135deg, hsl(44, 73%, 66%), hsl(44, 100%, 75%))
```
- Utilisé pour les éléments premium et CTAs

**Gradient AI:**
```css
linear-gradient(135deg, hsl(271, 91%, 65%), hsl(271, 91%, 55%))
```
- Utilisé pour les sections IA

**Gradient Neural:**
```css
radial-gradient(circle at 50% 50%, hsl(44, 73%, 66% / 0.2), transparent 70%)
```
- Effet halo neural pour les overlays

### ✨ Effets Lumineux (Glows & Shadows)

**Glows:**
- **Glow Gold**: `0 0 30px hsl(44, 73%, 66% / 0.5)`
- **Glow AI**: `0 0 30px hsl(271, 91%, 65% / 0.4)`
- **Glow Primary**: `0 0 30px hsl(167, 69%, 35% / 0.4)`

**Shadows:**
- **Shadow Soft**: `0 10px 40px -10px hsl(167, 69%, 18% / 0.15)`
- **Shadow Glass**: `0 8px 32px 0 hsl(0, 0%, 0% / 0.1)`

### 🔤 Typographie

**Familles de Polices:**
- **Playfair Display** (serif) - Pour les titres principaux
  - Usage: `font-playfair`
  - Poids: `font-bold` (700)
  - Tailles: `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`

- **Inter** (sans-serif) - Pour le corps de texte
  - Usage: `font-inter`
  - Poids: `font-medium` (500), `font-semibold` (600), `font-bold` (700)
  - Tailles: `text-sm`, `text-base`, `text-lg`, `text-xl`

**Hiérarchie Typographique:**
- **H1**: `font-playfair font-bold text-2xl md:text-4xl lg:text-5xl`
- **H2**: `font-playfair font-bold text-4xl md:text-5xl`
- **H3**: `font-playfair font-bold text-xl` ou `font-inter font-bold text-lg`
- **Body**: `font-inter text-base` ou `text-lg`
- **Small**: `font-inter text-sm`

### 📐 Espacements & Bordures

**Border Radius:**
- **Base**: `0.75rem` (12px) - `--radius`
- **Large**: `var(--radius)` = `0.75rem`
- **Medium**: `calc(var(--radius) - 2px)` = `0.625rem`
- **Small**: `calc(var(--radius) - 4px)` = `0.5rem`
- **Rounded Full**: `rounded-full` pour les boutons et badges

**Espacements:**
- Container padding: `2rem` (32px)
- Section padding vertical: `py-24` (96px)
- Gap entre éléments: `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)

### 🎭 Animations & Transitions

**Keyframes Personnalisées:**

1. **fade-in**: 
   - De: `opacity: 0, translateY(20px)`
   - À: `opacity: 1, translateY(0)`
   - Durée: `0.6s ease-out`

2. **fade-in-scale**:
   - De: `opacity: 0, scale(0.95)`
   - À: `opacity: 1, scale(1)`
   - Durée: `0.5s ease-out`

3. **glow-pulse**:
   - Effet de pulsation pour les éléments dorés
   - Durée: `2s ease-in-out infinite`
   - Filtre: `drop-shadow(0 0 8px)` → `drop-shadow(0 0 20px)`

4. **float**:
   - Animation de flottement vertical
   - Durée: `3s ease-in-out infinite`
   - Translation: `translateY(0px)` → `translateY(-10px)`

5. **particle-float**:
   - Animation complexe pour particules
   - Durée: `8s ease-in-out infinite`
   - Mouvement multidirectionnel

6. **counter-up**:
   - Animation de compteur
   - Durée: `0.8s ease-out`

**Transitions:**
- **Smooth**: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- **Glow**: `filter 0.3s ease, transform 0.3s ease`

### 🎯 Composants UI - Patterns de Design

#### Boutons
- **Primary**: `bg-secondary hover:bg-secondary/90 text-primary font-semibold px-8 py-6 rounded-full`
- **Outline**: `border-2 border-secondary hover:bg-secondary hover:text-primary`
- **Hover Effects**: `hover:scale-105 transition-all`, `hover:shadow-xl`

#### Cards
- **Base**: `border-2 hover:border-secondary transition-all duration-300`
- **Hover**: `hover:shadow-xl hover:-translate-y-2`
- **Background**: Gradients avec `opacity-50 group-hover:opacity-100`
- **Glow Effect**: `bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]`

#### Sections Hero
- **Background**: Image avec overlay gradient
- **Overlay**: `linear-gradient(rgba(13, 77, 68, 0.6), rgba(18, 18, 18, 0.7))`
- **Background Attachment**: `fixed` pour effet parallaxe
- **Particles**: Petits points animés avec `animate-particle-float`

#### Sections IA
- **Background**: Image sombre avec overlay
- **Overlay**: `linear-gradient(rgba(18, 18, 18, 0.92), rgba(13, 77, 68, 0.90))`
- **Light Effects**: Cercles flous animés avec `bg-secondary/20` et `bg-accent/20`
- **Glass Morphism**: `bg-background/5 backdrop-blur-md border border-secondary/30`

#### Header
- **Style**: `bg-background/80 backdrop-blur-md border-b border-border`
- **Position**: `fixed top-0 z-50`
- **Height**: `h-20` (80px)

#### Badges & Tags
- **Style**: `bg-primary/20 backdrop-blur-sm border border-gold/30 rounded-lg`
- **Padding**: `px-6 py-3`
- **Text**: `text-gold font-medium`

### 🖼️ Images & Assets

**Images Principales:**
- `hero-handshake.jpg` - Image hero principale
- `hero-cosmic.jpg` - Image alternative hero
- `ai-network.jpg` - Image section IA
- `logo.png` - Logo de l'entreprise

**Traitement des Images:**
- Background size: `cover`
- Background position: `center`
- Background attachment: `fixed` (parallaxe)

---

## 🚀 Fonctionnalités Principales

### 1. Landing Page
- **Hero Section**: Titre accrocheur avec CTAs
- **About Us**: Présentation des fondateurs (Abdenacer Maredj & Naim Seghiri)
- **Why We Exist**: Raison d'être de l'entreprise
- **Mission**: Mission et valeurs
- **Services**: 4 services principaux
- **AI Section**: Présentation de l'IA
- **Results**: Résultats et statistiques
- **Testimonials**: Témoignages clients
- **CTA**: Call-to-action final
- **Chatbot Qualif**: Chatbot de qualification

### 2. Authentification
- Supabase Auth (email/password)
- Rôles: Admin, Closer, Lead
- Routes protégées par rôle

### 3. Dashboard Closer
- **Kanban Board**: Gestion des leads (To Do → In Progress → Qualified → Closed)
- **Liste Leads**: Vue liste avec filtres
- **Détail Lead**: Historique, scoring Proton ANK, suggestions IA
- **Intégrations**: 
  - Google Calendar (rendez-vous)
  - HubSpot (synchronisation)
  - Slack (notifications)

### 4. Dashboard Admin
- **Analytics**: Statistiques et métriques
- **Content Editor**: Édition de contenu
- **Formations Manager**: Gestion des formations
- **Users Manager**: Gestion des utilisateurs
- **Closers Manager**: Gestion des closers

### 5. Proton ANK (LLM Propriétaire)
- **Backend FastAPI**: API REST pour le LLM
- **Modes Spécialisés**:
  - `acquisition`: Acquisition et closing
  - `structuration`: Organisation d'entreprise
  - `psychologie`: Analyse cognitive-comportementale
  - `scoring`: Scoring prédictif de leads
- **Support Darija**: Support natif du dialecte marocain
- **Fonctionnalités**:
  - Suggestions en temps réel
  - Scoring intelligent
  - Analyse psychologique
  - Génération d'emails personnalisés

### 6. Multilingue
- **Langues**: Français, Anglais, Darija (الدارجة المغربية)
- **Context**: `LanguageContext` avec système de traduction
- **Sélecteur**: Composant `LanguageSelector`

### 7. Thème
- **Modes**: Light, Dark, System
- **Provider**: `ThemeProvider` avec `next-themes`
- **Toggle**: Composant `ThemeToggle`

---

## 📁 Structure des Fichiers

```
the-ultimate-closers/
├── src/
│   ├── components/
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── admin/           # Composants admin
│   │   ├── closer/          # Composants closer
│   │   ├── booking/         # Composants réservation
│   │   └── shared/          # Composants partagés
│   ├── pages/               # Pages principales
│   ├── contexts/            # Contextes React
│   ├── hooks/               # Hooks personnalisés
│   ├── lib/                 # Utilitaires
│   ├── integrations/        # Intégrations (Supabase)
│   └── assets/              # Images et assets
├── supabase/
│   ├── functions/           # Edge Functions
│   └── migrations/          # Migrations SQL
├── proton-ank-backend/      # Backend Python FastAPI
├── tailwind.config.ts       # Configuration Tailwind
├── src/index.css            # Styles globaux + variables CSS
└── components.json          # Configuration shadcn/ui
```

---

## 🎯 Principes de Design

### Philosophie
1. **Élégance Premium**: Design sophistiqué avec or et vert malachite
2. **Conscience Éthique**: Transparence et respect dans l'interface
3. **Modernité IA**: Éléments violets pour l'IA, effets lumineux
4. **Lisibilité**: Contraste élevé, typographie claire
5. **Interactivité**: Animations subtiles, feedback visuel

### Règles d'Usage des Couleurs
- **Or (Gold)**: Éléments premium, CTAs, accents importants
- **Vert Malachite (Secondary)**: Boutons principaux, titres, éléments de navigation
- **Violet (Accent)**: Exclusivement pour les éléments IA
- **Neutres**: Arrière-plans, bordures, texte secondaire

### Règles Typographiques
- **Playfair Display**: Uniquement pour les titres (H1, H2, H3)
- **Inter**: Tout le reste (corps, navigation, boutons, etc.)
- **Hiérarchie**: Respecter strictement les tailles définies

### Animations
- **Principe**: Subtiles et professionnelles
- **Usage**: 
  - `fade-in` pour les sections
  - `fade-in-scale` pour les cards
  - `glow-pulse` pour les éléments dorés
  - `float` pour les éléments décoratifs
- **Timing**: Délais progressifs (`animationDelay`) pour créer un effet cascade

---

## 🔧 Configuration Technique

### Variables CSS (src/index.css)
Toutes les couleurs sont définies en HSL dans `:root` et `.dark`:
```css
:root {
  --background: 44 30% 95%;
  --foreground: 167 69% 18%;
  --primary: 44 73% 66%;
  --secondary: 167 69% 18%;
  --accent: 271 91% 65%;
  --gold: 44 73% 66%;
  --gold-glow: 44 100% 75%;
  --radius: 0.75rem;
}
```

### Tailwind Config
- **Dark Mode**: `["class"]` (manuel)
- **Container**: Centré, padding 2rem, max-width 1400px
- **Fonts**: `playfair` et `inter` définies
- **Colors**: Toutes référencent les variables CSS
- **Animations**: Toutes les keyframes personnalisées

---

## 📝 Guidelines pour Gemini

### Lors de la création/modification de composants:

1. **Respecter la Charte Graphique**:
   - Utiliser UNIQUEMENT les couleurs définies dans `index.css`
   - Ne jamais hardcoder des couleurs HSL directement
   - Utiliser les classes Tailwind: `bg-primary`, `text-secondary`, `border-gold`, etc.

2. **Typographie**:
   - Titres: `font-playfair font-bold`
   - Corps: `font-inter`
   - Respecter les tailles définies

3. **Animations**:
   - Ajouter `animate-fade-in` ou `animate-fade-in-scale` aux nouveaux éléments
   - Utiliser `animationDelay` pour créer des effets cascade
   - `hover:scale-105` pour les interactions

4. **Responsive**:
   - Mobile-first: `text-2xl md:text-4xl lg:text-5xl`
   - Grid: `grid md:grid-cols-2 lg:grid-cols-4`
   - Padding: `px-4 md:px-6 lg:px-8`

5. **Accessibilité**:
   - Contraste suffisant (vérifier avec les couleurs définies)
   - Labels ARIA pour les icônes
   - Navigation au clavier

6. **Performance**:
   - Lazy loading des images
   - Optimisation des animations (GPU-accelerated)
   - Code splitting pour les routes

---

## 🎨 Exemples de Code

### Bouton Primary
```tsx
<Button 
  className="bg-secondary hover:bg-secondary/90 text-primary font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
>
  Action
</Button>
```

### Card avec Hover
```tsx
<Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
  <CardContent className="relative z-10">
    {/* Contenu */}
  </CardContent>
</Card>
```

### Section Hero
```tsx
<section 
  className="relative min-h-screen flex items-center justify-center"
  style={{
    backgroundImage: `linear-gradient(rgba(13, 77, 68, 0.6), rgba(18, 18, 18, 0.7)), url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}
>
  {/* Contenu */}
</section>
```

### Titre Principal
```tsx
<h1 className="font-playfair font-bold text-2xl md:text-4xl lg:text-5xl text-white mb-6 leading-tight">
  Titre Principal
</h1>
```

---

## ✅ Checklist de Conformité

Avant de finaliser un composant, vérifier:
- [ ] Couleurs utilisent les variables CSS (pas de hardcode)
- [ ] Typographie respecte Playfair (titres) / Inter (corps)
- [ ] Animations ajoutées si approprié
- [ ] Responsive (mobile, tablette, desktop)
- [ ] Dark mode testé
- [ ] Accessibilité (contraste, ARIA)
- [ ] Performance (lazy loading, optimisations)

---

**Note**: Cette charte graphique est la référence absolue. Tout écart doit être justifié et documenté. L'identité visuelle de "The Ultimate Closers" repose sur l'élégance de l'or, la confiance du vert malachite, et la modernité du violet IA.

