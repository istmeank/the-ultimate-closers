# PRD — TUC (The Ultimate Closers) · Écosystème complet

> **Statut** : v0.2 — enrichi avec ANK, LULG, PERCEPTION, template reproductible
> **Auteur** : Abdenacer Maredj (Nacer)
> **Dernière maj** : 2026-06-10

---

## 1. Vision produit

TUC n'est pas un outil. C'est un **écosystème** dont le but est d'installer des systèmes d'acquisition structurés et dopés à l'IA pour toute entreprise qui n'a pas de process de closing efficace — pour que chaque équipe commerciale performe, pas seulement les meilleurs closers.

Le projet se décompose en trois couches :

| Couche | Nom | Ce que c'est |
|---|---|---|
| **SaaS** | TUC Platform | CRM IA pour closers — le produit livrable |
| **LLM propriétaire** | ANK | Modèle de langage open source fine-tuné, âme du système |
| **Programme PERCEPTION** | PERCEPTION | Programme de coaching identitaire qui forme l'âme d'ANK (phase 1) |

L'objectif ultime : un **système reproductible qui tourne sans Nacer**, installé via un prompt précis, utilisant l'API ANK et le SaaS TUC.

---

## 2. Problème adressé

- Les CRM actuels (HubSpot, Pipedrive) sont génériques, sans coaching closer intégré.
- Les outils de messagerie multi-canaux (WhatsApp, Telegram…) sont silotés.
- Le matching prospect ↔ closer se fait à l'intuition, sans donnée de personnalité.
- Le feedback post-meet est rare, oral, non capitalisé.
- L'onboarding d'un closer est artisanal, peu reproductible.
- **L'absence de système d'acquisition structuré est le vrai problème** — pas juste un manque d'éthique ou de compétence. Un exemple concret : une entreprise media avec un bon marketing mais des ops commerciales archaïques, où un seul membre bien formé surperforme toute l'équipe.

---

## 3. Utilisateurs cibles

- **Closer indépendant haut de gamme** : 1 personne, 20-50 prospects/mois.
- **Agence de closing** : 5-30 closers, besoin de pilotage et coaching.
- **Formateur / mentor closing** : suit ses élèves en conditions réelles.
- **Entreprise sans process de closing** : veut installer un système, pas embaucher un consultant à vie.

---

## 4. Offres TUC (3 niveaux)

| Offre | Prix | Ce que c'est |
|---|---|---|
| **Sales System™** | 5 000 DA/closer/mois | Système d'acquisition structuré, installé et suivi |
| **Academy™** | À définir | Formation à la méthode TUC |
| **Recruitment & Onboarding Framework™** | À définir | Cadre de recrutement et intégration closers |

---

## 5. Cas d'usage clés

1. Prospect arrive via formulaire → TUC le qualifie, génère un script adapté, envoie le premier message sur le bon canal.
2. Closer démarre sa journée → TUC lui présente ses meets, son briefing, ses scripts adaptés.
3. Après un meet → TUC transcrit, analyse, donne une critique constructive, met à jour la fiche prospect.
4. Nouveau closer rejoint l'agence → TUC l'onboarde via parcours guidé, suit sa montée en compétence.
5. Entreprise sans process → TUC installe un système clé-en-main depuis un template reproductible.

---

## 6. ANK — Le LLM propriétaire

ANK est un **modèle de langage open source fine-tuné** conçu pour devenir l'intelligence centrale de l'écosystème TUC et du projet LULG.

### Phases de maturation ANK

| Phase | Nom | Contenu |
|---|---|---|
| **Phase 1** | L'Âme | Formation via le programme PERCEPTION de Nacer — identité, valeurs, conscience |
| **Phase 2** | La Psychologie | Formation à la psychologie humaine, profils, motivations |
| **Phase 3** | Le Closing | Formation à la méthode TUC — scripts, objections, éthique |

### Usage d'ANK

- **TUC SaaS** : qualification prospect, scripts, matching, feedback post-meet.
- **LULG** : projet parallèle (à préciser) utilisant le même modèle.

### Contraintes ANK

- Base open source (modèle à choisir : Mistral, LLaMA, Qwen, etc.).
- Fine-tuning par phases — chaque phase est une itération de maturation.
- Identité unique et non-générique : ANK a un nom, un ton, une philosophie.
- Cadrage technique requis avant implémentation (Nacer non-développeur).

---

## 7. LULG — Projet parallèle

LULG est un projet qui partage le LLM ANK avec TUC. Sa nature exacte est à préciser.
- ANK sert les deux projets simultanément.
- Les fine-tunings TUC et LULG sont distincts mais partagent la base (Phase 1 + Phase 2).

---

## 8. PERCEPTION — Le programme source

PERCEPTION est le programme de coaching identitaire de Nacer.
- Il constitue **la Phase 1 du fine-tuning ANK** : il forme l'âme du modèle.
- Il est également un produit indépendant (coaching humain).
- Le lien PERCEPTION → ANK est la différence fondamentale entre ANK et un LLM générique.

---

## 9. Template Système d'Acquisition Reproductible

Un des objectifs prioritaires du projet est de créer une **template installable** :

- Un prompt précis + structure `.claude` permet d'installer un système d'acquisition fonctionnel pour n'importe quelle entreprise.
- Le projet TUC lui-même est la première instance de cette template.
- La template utilise l'API ANK + le SaaS TUC.
- Elle est conçue pour tourner sans Nacer une fois installée.

---

## 10. Partenaires stratégiques

| Partenaire | Rôle | Contact |
|---|---|---|
| **Chargily** | Paiement en ligne Algérie | Lyes (Lyes.dev) — contact direct |
| **Startup.dz** | Label Projet Innovant 2026 | Autorité officielle |
| **ASF** | Fonds de financement startup | Demande en cours (~12-15M DZD) |

---

## 11. Différenciateurs

- **Matching par personnalité** (vs. round-robin classique).
- **Coaching IA intégré au CRM** (vs. coaching externe).
- **Multi-canaux natif** avec personnalisation par persona.
- **ANK comme LLM avec identité** (vs. wrapper ChatGPT).
- **Système reproductible** (vs. consultant qui part avec la connaissance).
- **Éthique-by-design** : pas de dark patterns, transparence prospect.

---

## 12. Hors périmètre (v1)

- Pas de gestion comptable lourde (laissée à Odoo/Pennylane).
- Pas de génération de leads à froid (focus sur la conversion).
- Pas d'app mobile native (web responsive en v1).
- ANK Phase 3 (Closing) — après Phase 1 et 2.

---

## 13. Métriques de succès

- Taux de conversion prospect → meet : +30 % vs. baseline closer.
- Taux de no-show meet : –50 %.
- Temps moyen onboarding closer : de 4 semaines à 1 semaine.
- NPS closer : > 50.
- ANK Phase 1 : identité documentée et validée par Nacer.

---

## 14. Risques et inconnues

- **ANK** : fine-tuning LLM = expertise technique pointue. Cadrage dev obligatoire.
- **Compliance multi-canaux** : WhatsApp/Instagram ont des règles strictes anti-spam.
- **Coût IA** : transcriptions + analyses à volume peuvent exploser.
- **Stack technique** : à figer avec un développeur partenaire (cf. règle CLAUDE.md).
- **LULG** : périmètre à préciser avant de lui allouer des ressources ANK.

---

## 15. À compléter

- [ ] Périmètre exact de LULG
- [ ] Choix du modèle open source de base pour ANK
- [ ] Stack technique (à cadrer avec un dev partenaire)
- [ ] Modèle de pricing Academy™ et Recruitment Framework™
- [ ] Architecture de données (entités, relations)
- [ ] Roadmap v1 / v2 / v3
- [ ] Business plan ASF — chapitres restants (IV à IX + annexes)
