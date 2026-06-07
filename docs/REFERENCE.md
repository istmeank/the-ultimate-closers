# PRD — TUC (The Ultimate Closers)

> **Statut** : v0.1 — Brouillon initial à enrichir avec le business plan
> **Auteur** : Abdenacer Maredj
> **Dernière maj** : 2026-06-07

---

## 1. Vision produit
TUC est un **CRM augmenté par l'IA** qui orchestre l'intégralité du cycle commercial d'un closer, du premier contact prospect à la critique post-meet. L'objectif : libérer le closer de toute friction opérationnelle pour qu'il se concentre sur la relation humaine, et garantir que chaque prospect rencontre le bon closer au bon moment avec le bon message.

## 2. Problème adressé
- Les CRM actuels (HubSpot, Pipedrive) sont génériques et n'intègrent pas le coaching closer.
- Les outils de messagerie multi-canaux (WhatsApp, Telegram, etc.) sont silotés.
- Le matching prospect ↔ closer se fait à l'intuition, sans donnée de personnalité.
- Le feedback post-meet est rare, oral, non capitalisé.
- L'onboarding d'un closer est artisanal, peu reproductible.

## 3. Utilisateurs cibles
- **Closer indépendant haut de gamme** : 1 personne, gère 20-50 prospects/mois.
- **Agence de closing** : 5-30 closers, besoin de pilotage et de coaching.
- **Formateur / mentor closing** : suit ses élèves en conditions réelles.

## 4. Cas d'usage clés
1. Un prospect arrive via formulaire → TUC le qualifie, génère un script adapté, envoie le premier message sur le bon canal.
2. Un closer démarre sa journée → TUC lui présente ses meets, son briefing par prospect, ses scripts adaptés.
3. Après un meet → TUC transcrit, analyse, donne une critique constructive et met à jour la fiche prospect.
4. Un nouveau closer rejoint l'agence → TUC l'onboarde via parcours guidé et suit sa montée en compétence.

## 5. Domaines fonctionnels (voir `ARCHITECTURE.md`)
1. Acquisition & Qualification
2. Messagerie Multi-canaux
3. Matching IA Prospects ↔ Closers
4. Préparation Meet & Coaching
5. Onboarding & Suivi Closers

## 6. Différenciateurs
- **Matching par personnalité** (vs. round-robin classique).
- **Coaching IA intégré au CRM** (vs. coaching externe).
- **Multi-canaux natif** avec personnalisation par persona.
- **Éthique-by-design** : pas de dark patterns, transparence avec le prospect.

## 7. Hors périmètre (v1)
- Pas de gestion comptable lourde (laissée à Odoo/Pennylane).
- Pas de génération de leads à froid (focus sur la conversion).
- Pas d'app mobile native (web responsive en v1).

## 8. Métriques de succès
- Taux de conversion prospect → meet : +30 % vs. baseline closer.
- Taux de no-show meet : –50 %.
- Temps moyen onboarding closer : de 4 semaines à 1 semaine.
- NPS closer : > 50.

## 9. Risques et inconnues
- **Compliance multi-canaux** : WhatsApp/Instagram ont des règles strictes anti-spam. Cadrage juridique requis.
- **Coût IA** : volume de transcriptions + analyses peut exploser. Modèle économique à valider.
- **Stack technique** : à figer avec un développeur partenaire (cf. règle CLAUDE.md).

## 10. À compléter
- [ ] Business plan détaillé (Nacer doit le partager)
- [ ] Stack technique cible (à cadrer avec un dev)
- [ ] Modèle de pricing
- [ ] Architecture de données (entités, relations)
- [ ] Roadmap v1 / v2 / v3
