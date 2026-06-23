---
name: react-shadcn-design-system
description: Expertise complète pour coder le frontend de TUC en React 19 + Vite 5 + TypeScript strict + Tailwind v3 + shadcn/ui. Utilise systématiquement ce skill dès qu'il est question de Hooks React (useState/useMemo/useCallback/useTransition/useDeferredValue/useOptimistic/useActionState/Suspense), composants shadcn (DataTable, Command, Sidebar, Dialog, Sheet, Form), Tailwind dark mode brand-gold/brand-green TUC, vite.config manualChunks, TypeScript discriminated unions/utility types/generics, organisation src/ par domaine TUC (acquisition/messagerie/matching/meet/onboarding/shared), anti-patterns React (any, prop drilling, useEffect surchargé, inline styles, re-renders orphelins), ou checklist 12 points avant commit. Stack imposée non-négociable pour le CRM closer.
---


# **Synthèse Stratégique : Architecture Frontend React 19 pour TUC (CRM B2B)** 

Cette documentation technique définit les standards de développement pour le CRM TUC. En tant qu'architecte, j'impose cette stack pour garantir un **Coût Total de Possession (TCO)** réduit et une **Performance de Rendu (TTFMP)** optimale. Nous ne construisons pas une simple interface, mais un outil de haute précision pour agents commerciaux exigeants.

\--------------------------------------------------------------------------------

## **1\. Concepts Fondamentaux de React 19 pour le CRM TUC**

L'architecture de React 19 révolutionne la gestion de l'asynchronisme. Pour un CRM B2B, la réduction de la latence perçue est vitale. L'utilisation systématique de `startTransition` et des nouveaux Hooks permet de maintenir une interface réactive même lors de mutations lourdes (ex: mise à jour massive de leads).

### **Implémentations Techniques Requises**

1. **Hooks Classiques (`useMemo`) :** Calcul du score de matching.  
2. **Stabilité des Handlers (`useCallback`) :** Éviter les re-renders de composants `memo`.  
3. **Mises à jour non-urgentes (`useTransition`) :** Filtrage du pipeline sans bloquer l'input.  
4. **Défaillance de Rendu (`useDeferredValue`) :** Liste de contacts dense.  
5. **Optimisme métier (`useOptimistic`) :** Transition immédiate du statut "Lead".  
6. **Gestion d'Action (`useActionState`) :** Formulaire de création de compte.  
7. **Coordination UI (`Suspense`) :** Chargement granulaire des widgets dashboard.  
8. **Portals & Modales :** Isolation du DOM pour le closing contractuel.

\--------------------------------------------------------------------------------

## **2\. Configuration Vite 5 et Optimisation du Bundle**

Pour les agents en mobilité, chaque kilo-octet compte. Vite 5 permet d'éliminer les polyfills inutiles via un ciblage moderne (`esnext`), réduisant drastiquement le poids du bundle initial.

### **Configuration `vite.config.ts`**

```ts
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_'); // Sécurisation des variables
  
  return {
    build: {
      target: 'esnext', // Ciblage navigateurs modernes uniquement
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'charts'; // Isolation charts
              if (id.includes('@radix-ui')) return 'ui-core'; // Isolation primitives
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Seuil strict 1MB
    },
    // Injection sécurisée via import.meta.env.VITE_API_URL
  };
});
```

\--------------------------------------------------------------------------------

## **3\. TypeScript Strict : Patterns de Typage CRM**

Le typage strict est non-négociable. Il sépare la **Data Layer** (modèles API) de la **View Layer** (états UI).

* **Règle d'or :** Utiliser `interface` pour les contrats extensibles (props, APIs) et `type` pour les transformations complexes et les unions de statuts.

### **Standards de Typage TUC**

```ts
// Union discriminée pour la logique métier
type LeadStatus = 'New' | 'Contacted' | 'Closing' | 'Won' | 'Lost';

// Interface extensible pour le domaine
interface Lead {
  readonly id: string;
  value: number;
  status: LeadStatus;
}

// Utilisation des types utilitaires pour la vue
type LeadCardProps = Pick<Lead, 'id' | 'status'> & { isCompact?: boolean };

// Composant générique robuste avec contrainte d'ID
interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Array<{ header: string; accessor: keyof T }>;
}

export function DataTable<T extends { id: string | number }>({ data, columns }: DataTableProps<T>) {
  return (
    <table>
      {data.map((item) => <tr key={item.id}>{/* ... */}</tr>)}
    </table>
  );
}
```

\--------------------------------------------------------------------------------

## **4\. Système de Design avec Tailwind CSS v3**

L'approche utility-first est imposée pour garantir la cohérence atomique du design TUC. Nous utilisons une méthodologie *mobile-first* stricte pour assurer la productivité des agents sur le terrain.

### **Configuration `tailwind.config.ts`**

```ts
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Gestion explicite via dark:
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4AF37', // Or Premium
          green: '#064E3B', // Vert Respect
        }
      },
      transitionDuration: {
        DEFAULT: '150ms', // Fluidité uniforme
      }
    }
  }
}
```

\--------------------------------------------------------------------------------

## **5\. Composants CRM avec shadcn/ui**

L'adoption de shadcn/ui n'est pas un choix esthétique, mais stratégique : nous possédons le code source de nos composants (**Open Code**). Cela permet d'adapter Radix UI aux besoins spécifiques de TUC sans dépendance bloquante.

* **Gestion des Variantes :** Utilisation obligatoire de `cva` (Class Variance Authority) et `cn()` (Tailwind Merge) pour la manipulation dynamique des styles sans collisions CSS.  
* **Composants Prioritaires :** `Command` (recherche globale), `DataTable` (gestion massive), et `Sidebar` (navigation métier).

\--------------------------------------------------------------------------------

## **6\. Organisation du Répertoire `/src` par Domaines**

L'architecture par domaines limite le couplage et permet aux équipes de travailler en parallèle sur des modules distincts (Acquisition vs Messaging).

```
src/
├── acquisition/    # Prospection, tunnels de vente
├── messagerie/     # Chat temps réel, notifications
├── matching/       # Logique de scoring et mise en relation
├── shared/         # Hooks transversaux, utils, components/ui
└── lib/            # Configurations tierces (API clients)
```

*Note : Tout import croisé entre domaines doit passer par un export explicite dans un fichier `index.ts` à la racine du domaine.*

\--------------------------------------------------------------------------------

## **7\. Prévention Technique : 10 Anti-patterns à Proscrire**

1. **Surcharge de `useEffect` :** Interdiction de synchroniser des états locaux ; utiliser le calcul au rendu.  
2. **Prop Drilling :** Utilisation impérative de `useContext` ou d'un store pour les données globales.  
3. **Styles Inline :** Tolérés uniquement pour les valeurs dynamiques (ex: progression de barres).  
4. **Strings en dur :** Tout label doit être externalisé pour préparer l'i18n.  
5. **Re-renders Orphelins :** Manque de `memo` sur les composants de lignes de tableau (Listes \> 100 items).  
6. **Usage de `any` :** Motif de rejet immédiat en Code Review. Utiliser `unknown` ou des génériques.  
7. **Mises à jour bloquantes :** Oubli de `startTransition` sur les changements de filtres globaux.  
8. **Suspense Saccadé :** Granularité trop fine créant des "pop-ins" visuels désagréables.  
9. **Logique métier dans la View :** Les calculs de scoring doivent vivre dans des hooks dédiés.  
10. **Ignorer l'Accessibilité :** Absence de labels ARIA sur les composants interactifs shadcn/ui.

\--------------------------------------------------------------------------------

## **8\. Protocole de Validation : Checklist 12 Points Avant Commit**

* \[ \] **TS Zero Error :** `tsc --noEmit` validé.  
* \[ \] **Bundle Budget :** Vérification via build-report : aucun chunk \> 1MB.  
* \[ \] **TUC Branding :** Utilisation stricte des tokens `brand-gold` et `brand-green`.  
* \[ \] **Feedback Async :** Tout appel API est couvert par un `Skeleton` ou `isPending`.  
* \[ \] **Stability Transition :** Utilisation de `startTransition` pour éviter les fallbacks brutaux sur contenu existant.  
* \[ \] **Ref Stability :** Validation de la stabilité des `refs` sur les composants Radix/shadcn.  
* \[ \] **Portals Z-Index :** Vérification de la superposition correcte des modales via `Portals`.  
* \[ \] **Optimistic UI :** Les actions critiques (statut transaction) sont visuellement instantanées.  
* \[ \] **Clean Debug :** Aucun `console.log` ou `debugger` résiduel.  
* \[ \] **Responsive Test :** Rendu validé sur viewport mobile (375px).  
* \[ \] **Aria Compliance :** Focus states et labels ARIA opérationnels.  
* \[ \] **No Cyclic Imports :** Respect strict de la structure par domaine.

