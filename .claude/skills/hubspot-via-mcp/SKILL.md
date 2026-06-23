---
name: hubspot-via-mcp
description: Expertise pour interagir avec HubSpot via le MCP HubSpot connecté à TUC (pas de SDK custom à coder). Utilise systématiquement ce skill dès qu'il est question de sync HubSpot contacts/deals/companies/tickets, recherche entreprise/contact dans le CRM HubSpot, mise à jour propriétés HubSpot, attribution owner deal, query CRM data avec filtres avancés, campaign analytics HubSpot, mapping leads TUC ↔ contacts HubSpot, conflict resolution last-write-wins via timestamp, table external_sync_log TUC pour idempotency hubspot_id. Le MCP fournit 13 tools natifs ; ce skill explique quand utiliser chacun, comment éviter la duplication, et comment maintenir la cohérence multi-tenant.
---

# HubSpot via MCP — Guide stratégique d'usage TUC

## 1. Pourquoi via MCP plutôt qu'un SDK custom

Le MCP HubSpot connecté au projet TUC fournit **13 tools natifs** qui couvrent 95% des cas d'usage CRM. Pas besoin d'écrire un client HubSpot custom dans `src/integrations/hubspot/` : l'agent IA TUC appelle directement les tools MCP, qui s'occupent de l'auth, du rate limiting, des retry, et de la pagination.

**Avantages** :
- Pas de gestion OAuth flow côté TUC (le MCP a déjà l'auth résolue)
- Pas de SDK à maintenir / mettre à jour
- Pas de gestion rate limit côté TUC (100 req/10s, 250k/jour : le MCP s'en charge)
- Pas de retry / timeout / backoff à coder
- Types alignés sur la doc HubSpot officielle

**Limites** :
- Ne couvre PAS les webhooks HubSpot entrants → utilise skill `webhook-security-idempotency` pour ça
- Ne couvre PAS le sync bidirectionnel automatique → c'est notre travail de l'orchestrer via Edge Functions + table `external_sync_log`

## 2. Catalogue des 13 tools MCP HubSpot disponibles

| Tool | Usage TUC |
|---|---|
| `get_crm_objects` | Récupérer 1+ objets par ID (contacts, deals, companies, tickets) |
| `search_crm_objects` | Filtrer dynamiquement (par email, score, owner, dates...) |
| `manage_crm_objects` | Create/update/delete objets CRM (idempotent via idempotency_key) |
| `query_crm_data` | Requêtes complexes multi-objets (joins logiques) |
| `get_properties` | Lister les propriétés d'un type d'objet (schema discovery) |
| `search_properties` | Trouver une propriété par nom/label |
| `get_organization_details` | Infos sur l'entreprise propriétaire du portail HubSpot |
| `get_user_details` | Infos sur un user HubSpot (sales rep, admin) |
| `search_owners` | Trouver le bon owner (closer) HubSpot pour assigner un deal |
| `get_campaign_analytics` | KPIs d'une campaign marketing |
| `get_campaign_asset_metrics` | Métriques par asset (email, page) |
| `get_campaign_contacts_by_type` | Liste des contacts d'une campaign segmentés |
| `tool_guidance` | Méta : récupérer doc inline sur n'importe quel tool MCP HubSpot |

**Toujours commencer par `tool_guidance`** quand on hésite sur les paramètres d'un tool. Réflexe pro.

## 3. Patterns récurrents TUC

### 3.1 — Sync lead TUC → contact HubSpot (création)
```
1. Lead créé dans table TUC `leads`
2. Trigger SQL → Edge Function /sync-hubspot
3. Edge Function appelle MCP : manage_crm_objects (op: create, type: contact, props: {email, firstname, lastname, lifecyclestage: "lead", phone, custom_score: lead.score})
4. Réponse HubSpot → contient hubspot_id (ex: "12345")
5. Edge Function insert dans external_sync_log : (entity_type="lead", entity_id=lead.id, hubspot_id, status="success")
```

### 3.2 — Mise à jour bidirectionnelle (last-write-wins via timestamp)
```
1. Lead updated dans TUC (status change → "won")
2. Vérifier dans external_sync_log si hubspot_id existe pour ce lead
3. Si oui : MCP manage_crm_objects (op: update, type: contact, id: hubspot_id, props: {lifecyclestage: "customer", lastmodifieddate: now()})
4. Si conflit (HubSpot a updated entre temps) : compare lastmodifieddate, garde le plus récent
```

### 3.3 — Recherche pour qualification
```
1. Nouveau formulaire reçu sur theultimateclosers.com
2. Avant création TUC : MCP search_crm_objects (type: contact, filter: email=submitted.email)
3. Si existe dans HubSpot : récupérer son score, propriétaire actuel, deals associés
4. Décision matching (skill workload-management-matching) avec ces données enrichies
```

### 3.4 — Attribution closer (deal assignment)
```
1. Lead chaud (score ≥ 75) à assigner
2. MCP search_owners (filter: active=true, has_capacity) → liste closers HubSpot
3. Cross-match avec table TUC profiles (skill workload-management-matching)
4. MCP manage_crm_objects (op: update, type: deal, id: deal_id, props: {hubspot_owner_id: closer.hubspot_id})
```

## 4. Gestion de l'idempotence (table external_sync_log TUC)

Table déjà créée dans baseline TUC-v2 :
```sql
external_sync_log (
  entity_type TEXT CHECK (entity_type IN ('lead','deal','appointment','contact')),
  entity_id UUID NOT NULL,
  hubspot_id TEXT,
  last_sync TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT CHECK (status IN ('success','failed','pending')),
  error TEXT
)
```

**Règles d'usage** :
- Avant chaque opération MCP, **vérifier la table** : si `hubspot_id` existe → operation UPDATE, sinon CREATE
- Après chaque opération MCP réussie, **mettre à jour `last_sync`**
- En cas d'erreur MCP : insert `status='failed'` + message dans `error`, retry exponential backoff (skill `webhook-security-idempotency`)
- Cron hebdo (skill `supabase-edge-functions-deno`) : audit des `status='failed'` non recovered + alerte Slack si > 10

## 5. Mapping des propriétés HubSpot ↔ TUC

| Propriété HubSpot | Champ TUC | Notes |
|---|---|---|
| `email` | `leads.email` | unique key cross-system |
| `firstname` + `lastname` | `leads.full_name` (concat) | parsing si needed |
| `phone` | `leads.phone` | format E.164 recommandé |
| `lifecyclestage` | `leads.status` (mapped) | `subscriber → new`, `lead → qualified`, `customer → won` |
| `hubspot_owner_id` | `leads.owner_id` (via profiles.hubspot_id) | nécessite colonne `profiles.hubspot_id` à créer |
| `hs_lead_status` | (custom) | optionnel pour granularité |
| `hubspot_score` | `leads.score` | pull si HubSpot score plus à jour |

**Action future** : ajouter colonne `profiles.hubspot_id TEXT UNIQUE` pour mapper closers TUC ↔ owners HubSpot.

## 6. Anti-patterns à proscrire

1. **Coder un client HubSpot custom dans `src/integrations/hubspot/`** alors que le MCP couvre tout. Sauf cas EXTRÊME (Edge Function qui doit appeler HubSpot sans context MCP).
2. **Sync sans vérifier `external_sync_log`** → duplicates HubSpot, dette technique.
3. **Update sans timestamp comparison** → écrasement de modifs HubSpot par TUC.
4. **Ne pas mapper les rôles closer ↔ owner HubSpot** → attribution sans cohérence.
5. **Stocker les credentials HubSpot quelque part** → le MCP gère, ne pas réinventer.
6. **Sync à chaque update** sans batch → consomme rate limit. Préférer batch quotidien sauf pour leads chauds (immédiat).
7. **Oublier de gérer `archived` HubSpot** → les contacts/deals archivés ne sont pas par défaut dans les recherches.
8. **Ignorer les `associations` HubSpot** (contact ↔ deal ↔ company) → données incomplètes.

## 7. Checklist 10 points avant de déployer un flow HubSpot

- [ ] Table `external_sync_log` consultée avant chaque opération MCP
- [ ] Idempotency garantie par `hubspot_id` mapping
- [ ] Timestamp comparison sur tous les updates bidirectionnels
- [ ] Mapping propriétés validé (emails, phone format, lifecyclestage)
- [ ] Test de création + update + delete sur sandbox HubSpot avant prod
- [ ] Cron hebdo audit `status='failed'` configuré
- [ ] Alerte Slack `> 10 errors/h` configurée
- [ ] Logs MCP sans PII (jamais email/phone en clair)
- [ ] Webhook HubSpot entrants gérés via skill `webhook-security-idempotency`
- [ ] Doc inline `tool_guidance` consultée avant usage d'un tool peu connu

## 8. Quand passer au SDK custom HubSpot

Cas EXTRÊMES où le MCP ne suffit pas :
- Bulk import > 1000 contacts en une fois (le MCP a sa propre limite)
- Streaming réception de webhooks HubSpot (le MCP est request/response)
- Personnalisation de l'auth (ex. compte HubSpot par tenant) — n'arrive pas en v1 TUC

Dans 99% des cas, **MCP suffit + Edge Function pour orchestrer**.

## 9. Le sage roi des nuages

HubSpot est un outil, pas une religion. TUC reste closer-centric, pas HubSpot-centric. Le MCP nous évite de devenir esclaves d'un SDK. Garde le contrôle : c'est NOUS qui orchestrons HubSpot, pas l'inverse.
