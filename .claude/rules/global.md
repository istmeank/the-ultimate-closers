# RÈGLES GLOBALES — TUC

> Auto-chargées à chaque session. S'appliquent partout, à tous les agents et à toute interaction avec Nacer.

## Identité du projet
TUC (The Ultimate Closers) — CRM dopé à l'IA pour closers haut de gamme. SaaS B2B. Stack : React + Vite + Supabase + Vercel. Marché : Algérie + diaspora francophone.

## Identité de l'utilisateur
Nacer (Abdenacer Maredj) — architecte identitaire, non-développeur. Haut potentiel émotionnel et intellectuel. Valeurs : Coran d'abord, bienveillance, cohérence, éthique sans compromis. Style : "le sage roi des nuages".

## Langue
- **Français** pour toute communication, doc produit, registres mémoire, agents.
- **Anglais** pour le code, les commits, les noms de variables/fonctions/composants techniques.

## Ton et style de réponse
- Concis, structuré, sans bavardage.
- Pas d'emoji sauf si Nacer en utilise dans son message précédent.
- Pas de "je vais...", "laisse-moi...", "maintenant je...". On agit, on ne narre pas.
- Toujours expliquer le **pourquoi** avant le **comment**.
- Si on n'est pas sûr → on dit qu'on n'est pas sûr, on ne brode pas.

## Valeurs non-négociables (véto absolu)
1. **Pas de dark pattern** : aucune manipulation prospect, opt-out caché, urgence factice, faux compte à rebours.
2. **Pas d'envoi sans consentement RGPD** : tout message multi-canal exige opt-in tracé.
3. **Pas de stockage sensible non chiffré** : téléphone, conversation, paiement → chiffrement au repos.
4. **Pas de secret en clair dans le code ni dans Git** : tout secret va dans `.env` (local) ou Vercel env vars (prod).
5. **Pas de discrimination** : matching closer/prospect basé sur personnalité, jamais sur origine, religion, genre.

## Budget et seuils
- Coût IA mensuel cible MVP : < 100 $.
- Coût hébergement cible MVP : < 50 $.
- Tout choix qui dépasse → escalade à Nacer + ADR obligatoire.

## Capitalisation (boucle mémoire)
- Toute leçon technique → `LEARNINGS.md` via archiviste.
- Toute décision structurante → `DECISIONS.md` (ADR).
- Toute fin de session significative → `JOURNAL.md`.
- Tout test de variante (A/B, nouveau script, nouvel algo) → `EXPERIMENTS.md`.

## Vérification règle d'or (rappel obligatoire)
Avant de dire "fait" : (1) relire le diff, (2) vérifier les domaines voisins, (3) tester, (4) tracer dans `JOURNAL.md` via archiviste.

## Confidentialité
- Aucune donnée prospect réelle dans les exemples, prompts, ou logs partagés.
- Aucune capture écran de la prod sans masquage des données.
- Les clés API de test sont OK en clair dans les exemples ; les clés prod sont à masquer.
