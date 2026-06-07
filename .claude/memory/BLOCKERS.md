# BLOCKERS — Registre des blocages

> Tout bug, toute erreur récurrente, toute friction est consignée ici **dès qu'elle apparaît**.
> Une fois résolue, on déplace la solution dans `LEARNINGS.md` et on marque le blocage comme "résolu".

## La boucle (lire avant tout)
1. Tu rencontres un bug ou un obstacle → tu l'inscris ici, immédiatement.
2. Tu cherches la cause racine → tu documentes ce que tu as essayé.
3. Tu trouves la solution → tu la documentes ici.
4. Tu copies la leçon générale dans `LEARNINGS.md` (pour qu'on la retrouve hors contexte).
5. Tu marques le blocage "résolu" avec la date et le lien vers `LEARNINGS.md`.

## Format d'une entrée

```
## BLOCKER-001 — Titre court
- Date : YYYY-MM-DD
- Domaine : (acquisition / messagerie / matching / meet / onboarding / transverse)
- Symptôme : ce qu'on observe
- Hypothèses testées : ce qu'on a essayé et le résultat
- Statut : ouvert | résolu (voir LEARNING-XXX)
- Solution finale : (à remplir à la résolution)
```

---

<!-- Premier blocage à ajouter ici quand il arrive -->

## BLOCKER-001 — Tokens OAuth stockés en clair en DB
- Date : 2026-06-07
- Domaine : transverse (sécurité + intégrations)
- Symptôme : `closer_integrations.access_token`, `closer_integrations.refresh_token`, `google_calendar_tokens.access_token`, `google_calendar_tokens.refresh_token` sont des `TEXT` non chiffrés. Un dump DB = vol des comptes Google/Slack/HubSpot des closers.
- Hypothèses testées : aucune (constat à l'audit baseline).
- Statut : ouvert
- Solution finale : (à remplir) — chiffrement via Supabase Vault ou pgsodium. Décision : peut être différé en Vague 2 si la baseline est appliquée en environnement de dev, MUST avant prod réelle.
- Lien rapport : `docs/security-audit-baseline.md` §3 C2

## BLOCKER-002 — Enum `app_role` incohérent dans migrations Lovable
- Date : 2026-06-07
- Domaine : transverse (sécurité + DB)
- Symptôme : enum créé avec `('admin', 'user')` mais les migrations utilisent `'closer'::app_role` et `'owner'::app_role` qui n'existent pas. Les policies utilisant ces casts peuvent silencieusement ne jamais matcher → fuite de données.
- Hypothèses testées : aucune migration `ALTER TYPE app_role ADD VALUE` trouvée.
- Statut : ouvert
- Solution finale : (à remplir lors de la baseline) — définir l'enum complet `('owner', 'admin', 'closer', 'user')` dès le début dans `00000000000001_baseline.sql`.
- Lien rapport : `docs/security-audit-baseline.md` §3 C1

## BLOCKER-003 — Anti-pattern `auth.uid()` non wrappé partout
- Date : 2026-06-07
- Domaine : transverse (perf + sécurité)
- Symptôme : 90% des policies des 30 migrations utilisent `auth.uid()` au lieu de `(select auth.uid())` → perte de perf jusqu'à 99% sur tables volumineuses (cf. skill `supabase-auth-rls` anti-pattern #5).
- Hypothèses testées : aucune.
- Statut : ouvert
- Solution finale : (à remplir) — réécriture systématique dans baseline.
- Lien rapport : `docs/security-audit-baseline.md` §3 C3

## BLOCKER-004 — Fonction `has_role` redéfinie avec 2 signatures
- Date : 2026-06-07
- Domaine : transverse (sécurité)
- Symptôme : migration `20251023161623` définit `has_role(_user_id UUID, _role public.app_role)` (typage strict), migration `20251026162800` définit `has_role(user_id UUID, role_name TEXT)` (typage TEXT). Overload PostgreSQL → bypass possible si les policies utilisent la version TEXT.
- Hypothèses testées : aucune.
- Statut : ouvert
- Solution finale : (à remplir) — une seule fonction `has_role(uuid, app_role)` typée strict dans baseline.
- Lien rapport : `docs/security-audit-baseline.md` §3 C4

## BLOCKER-005 — `search_path` SECURITY DEFINER sans `pg_temp` en dernier
- Date : 2026-06-07
- Domaine : transverse (sécurité)
- Symptôme : toutes les fonctions DEFINER ont au mieux `SET search_path = public`. Aucune n'inclut `pg_temp` en dernière position → vecteur d'attaque par table temporaire malveillante (skill `postgresql-supabase` §4).
- Hypothèses testées : aucune.
- Statut : ouvert
- Solution finale : (à remplir) — `SET search_path = pg_catalog, public, pg_temp` partout dans baseline.
- Lien rapport : `docs/security-audit-baseline.md` §3 C5
