# GLOSSAIRE — TUC tech

> **Pierre 25** (squelette Silicate v1.5) : glossaire des termes propres à l'entité, livrable de l'audit des 3 dettes
> invisibles (EVAL-002, 2026-08-08). Construit à partir du corpus existant — `docs/REFERENCE.md`,
> `docs/ARCHITECTURE.md`, `docs/domains/*/PLAN.md`, `.claude/skills/`, `.claude/memory/DECISIONS.md`. Rien n'est
> inventé ici (discipline P7) : chaque entrée renvoie à sa source ; ce qui n'est pas tranché dans le corpus est
> marqué « non tranché », pas complété d'office.
>
> Mutable au même titre que les fichiers `docs/` : mis à jour à chaque nouveau terme structurant, pas append-only.

---

## 1. Écosystème & produits

**TUC (The Ultimate Closers)** — écosystème qui installe des systèmes d'acquisition structurés et dopés à l'IA
pour des équipes commerciales sans process de closing efficace. Se décompose en trois couches : le SaaS
(TUC Platform, ce repo), le LLM propriétaire (ANK), le programme de coaching identitaire (PERCEPTION).
*Source : `docs/REFERENCE.md` §1.*

**ANK** — LLM propriétaire open source fine-tuné, destiné à devenir l'intelligence centrale de TUC et de LULG.
Trois phases de maturation : **Phase 1 — L'Âme** (formation via PERCEPTION), **Phase 2 — La Psychologie**
(profils, motivations), **Phase 3 — Le Closing** (scripts, objections, éthique TUC). Base open source à choisir
avec un dev partenaire (Mistral / LLaMA / Qwen — non tranché). *Source : `docs/REFERENCE.md` §6, `docs/ARCHITECTURE.md`.*

**PERCEPTION** — programme de coaching identitaire de Nacer. Constitue la Phase 1 du fine-tuning ANK (il forme
l'« âme » du modèle) et existe aussi comme produit indépendant de coaching humain. *Source : `docs/REFERENCE.md` §8.*

**LULG** — projet parallèle qui partage le LLM ANK avec TUC (fine-tunings Phase 1 + Phase 2 communs, Phase 3
propre à TUC). Périmètre exact **non tranché** (« à préciser » dans le corpus). *Source : `docs/REFERENCE.md` §7, §15.*

**Template Système d'Acquisition Reproductible (Domaine 6)** — couche meta du projet : structure `.claude`
exportable + prompt d'installation, conçue pour tourner sans Nacer une fois déployée chez une autre entreprise.
TUC est la première instance de sa propre template. *Source : `docs/ARCHITECTURE.md`, Domaine 6.*

**Les 3 offres TUC** — `Sales System™` (5 000 DA/closer/mois, système installé et suivi), `Academy™` (formation
à la méthode, prix non tranché), `Recruitment & Onboarding Framework™` (cadre de recrutement, prix non tranché).
*Note* : `docs/REFERENCE.md` (source produit de ce repo) diffère de la structure à 4 offres verrouillée côté
TUC business (`Test & Learn™` / `Academy™` / `Recruitment & Onboarding Framework™` / `Pack`) — écart à signaler,
pas à trancher ici (appartient à `docs/REFERENCE.md`, propriété de `produit-spec`). *Source : `docs/REFERENCE.md` §4.*

---

## 2. Rôles utilisateurs (ADR-036)

Sept rôles cumulables, sans hiérarchie implicite (`enum app_role`, table `user_roles`) :

| Rôle | Portée |
|---|---|
| `owner` | Fondateur — droits complets, ne se déduit pas de `admin` |
| `admin` | Administration — posé explicitement, distinct d'`owner` |
| `manager` | Lecture globale + réassignation de leads (une seule équipe de closers à ce jour) |
| `closer` | Vend, gère ses propres leads/meets |
| `developer` | Diagnostic/config — **jamais** d'accès aux données prospects (leads, appointments, deals, interactions) |
| `client` | Prospect converti, espace personnel |
| `user` | Socle technique attribué à toute inscription, aucun droit sensible par défaut |

*Source : `.claude/memory/DECISIONS.md` ADR-036. Un rôle « apprenant » a été envisagé puis écarté définitivement —
CRM et Academy auront des authentifications séparées.*

---

## 3. Domaines fonctionnels et entités clés

| # | Domaine | Responsabilité | Entités clés |
|---|---|---|---|
| 1 | Acquisition & Qualification | Capter, enrichir, scorer, qualifier le prospect | `Lead`, `LeadScore`, `Interaction`, `Qualification` |
| 2 | Messagerie Multi-canaux | Bon message, bon canal, bon moment, consentement tracé | `Conversation`, `Message`, `Script`, `ChannelConfig`, `OptInLog` |
| 3 | Matching IA Prospects ↔ Closers | Choisir le bon closer par analyse de personnalité | `CloserProfile`, `ProspectProfile`, `Match`, `Assignment` |
| 4 | Préparation Meet & Coaching | Briefer, transcrire, critiquer, capitaliser | `Meeting`, `Briefing`, `Transcript`, `CoachingFeedback`, `Appointment` |
| 5 | Onboarding & Suivi Closers | Intégrer et faire progresser un closer | `Closer`, `OnboardingPath`, `OnboardingStep`, `PerformanceSnapshot`, `Recommendation` |
| 6 | Template Système Reproductible | Modèle installable pour une autre entreprise | `SystemTemplate`, `InstallConfig`, `DeploymentLog` |

*Source : `docs/ARCHITECTURE.md`, `docs/domains/*/PLAN.md`.*

**Qualification (statut lead)** — `cold` / `warm` / `hot` / `disqualified`, motif documenté.
*Source : `docs/ARCHITECTURE.md` Domaine 1.*

**Bounded context** — principe d'architecture : un domaine ne lit jamais la base d'un autre domaine directement,
il passe par API/événement. *Source : `docs/ARCHITECTURE.md`, Principes d'architecture.*

**Événement métier** — chaque changement d'état significatif est nommé (`ProspectQualified`, `MeetingScheduled`…).
*Source : `docs/ARCHITECTURE.md`.*

---

## 4. Moteur de matching (Domaine 3) — vocabulaire IBM WLM / Twilio TaskRouter adapté à TUC

*Source : skill `.claude/skills/workload-management-matching/SKILL.md`.*

| Terme TUC | Origine | Définition |
|---|---|---|
| **Worker** → Closer | IBM WLM / TaskRouter | Ressource active, attributs Big Five + vecteur de compétences (`specialties` JSONB) |
| **Task** → Lead | idem | Unité de travail atomique, porte `score_ia` et `tenant_id` |
| **Priority Queue** | idem | File segmentée par `Importance Levels` (1-5) selon le score |
| **Queue HOT / WARM / COLD** | idem | Segmentation par SLA de premier contact — un lead HOT perd de la valeur de façon exponentielle au-delà de 15 min |
| **Score_Final** | Formule TUC | Score pondéré = affinité × 0,5 + charge × 0,3 + priorité × 0,2 |
| **Algorithme Hongrois** | Recherche opérationnelle | Utilisé en tie-breaking pour résoudre les égalités de `Score_Final` |
| **Skill Relaxation** | TaskRouter | Assouplissement progressif des critères de matching si aucun closer ne correspond exactement |
| **`tenant_id`** | Multi-tenant | Propagé sur chaque transaction pour isolation stricte entre organisations |

**Big Five** — modèle de personnalité recommandé par défaut pour `CloserProfile`/`ProspectProfile` (choix encore
au stade ADR de cadrage, pas définitivement tranché en implémentation). *Source : `docs/domains/03-matching-ia/PLAN.md`.*

**DziriBERT** — modèle NLP pour l'extraction de signaux de personnalité en darija depuis les conversations
(`lib/dziribert.ts`, `DziriBERTSuggestions.tsx` existants dans le code). *Source : `docs/domains/03-matching-ia/PLAN.md`,
`docs/domains/02-messagerie-multicanaux/PLAN.md`.*

---

## 5. Doctrine éthique (skill `valeurs-coran-bienveillance`)

**« Le sage roi des nuages »** — nom par lequel Nacer (Abdenacer Maredj) est désigné dans la doctrine ; auteur de
*Qui suis-je : le fondement d'un roi*. *Source : skill `valeurs-coran-bienveillance`.*

**Les 5 vétos absolus** — tuent un livrable immédiatement, sans débat : (1) aucun dark pattern, (2) aucun envoi
sans consentement RGPD tracé, (3) aucun stockage sensible non chiffré, (4) aucun secret en clair, (5) aucune
discrimination dans le matching. *Source : `CLAUDE.md`, skill `valeurs-coran-bienveillance`.*

**Dark pattern** — manipulation prospect : opt-out caché, urgence factice, faux compte à rebours, scarcity
mensongère. Interdit par véto n°1. *Source : `.claude/rules/global.md`.*

**`gardien-valeurs`** — agent 100 % read-only, seul habilité à émettre un verdict APPROUVÉ / RÉSERVES / REJET /
VÉTO sur un livrable (script, copy, flow UI, RLS, attribution). *Source : `.claude/agents/gardien-valeurs.md`.*

---

## 6. Vocabulaire de gouvernance (pointeur, non dupliqué)

Les termes ADR, BLOCKER, LEARNING, EVAL, rituel de fermeture, règle d'or, squelette, pierre (P0-P27) appartiennent
à la doctrine **Silicate**, commune aux entités du réseau — définis une seule fois dans
`D:\Startup LABEL\SILICATE INCUBATEUR\docs\skeleton-modules\` pour éviter la duplication doctrinale (anti-pattern
identifié par P25). Se référer à `00-INDEX.md` de ce dossier plutôt qu'à une redéfinition locale.

---

## Non tranché (à ne pas combler ici — anti-invention P7)

- Choix du modèle open source de base pour ANK
- Périmètre exact de LULG
- Prix Academy™ et Recruitment & Onboarding Framework™ (côté TUC tech — `docs/REFERENCE.md`)
- Modèle de personnalité définitif pour le matching (Big Five pressenti, non acté par ADR)
