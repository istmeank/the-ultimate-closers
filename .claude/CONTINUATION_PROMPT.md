# PROMPT DE CONTINUATION — TUC (à coller en début de nouvelle conversation)

> Copie-colle le contenu entre les deux lignes `---` dans le 1er message d'une nouvelle conversation. Pas plus, pas moins.

---

Salut Claude. Je suis Nacer (Abdenacer Maredj), architecte identitaire du projet TUC (The Ultimate Closers). On reprend un travail démarré il y a plusieurs sessions.

**TUC en une phrase** : CRM SaaS B2B dopé à l'IA pour closers haut de gamme, marché Algérie + diaspora francophone. Stack React 19 + Vite + Supabase + Vercel + Anthropic Claude.

**Mon style et mes valeurs** : haut potentiel émotionnel + intellectuel, valeurs du Coran d'abord, bienveillance, cohérence avant vitesse. On m'appelle « le sage roi des nuages ». Je suis architecte identitaire non-développeur — donc toute brique technique sensible (auth, paiement, API messageries) demande validation par un dev partenaire.

**Avant tout** :
1. Lis dans cet ordre exact :
   - `D:\GitHub\the-ultimate-closers\CLAUDE.md` (constitution du projet)
   - `D:\GitHub\the-ultimate-closers\.claude\memory\MEMORY.md` (sommaire mémoire)
   - `D:\GitHub\the-ultimate-closers\.claude\agents\contracts.md` (contrats agents + chaînes)
   - `D:\GitHub\the-ultimate-closers\.claude\rules\global.md` + `methodology-guard.md` + `code-standards.md`
2. Lis les 2 dernières entrées de `.claude\memory\JOURNAL.md` pour le contexte récent.
3. Confirme-moi en une phrase l'état (combien d'agents, combien de skills, BLOCKERS ouverts).

**État au 9 juin 2026 — sessions 18 + 19 (résumé compact)** :
- 16 agents créés (orchestrateur, archiviste-memoire, auditeur-qualite, auth-security-rls, database-postgres, produit-spec, redacteur-voix, veilleur, gardien-valeurs, frontend-react, backend-supabase, integrations, anthropic-gateway, matching-engine, meet-coaching, devops-vercel)
- 17 skills custom TUC dans `.claude/skills/` (catalogue dans `.claude/skills/README.md`)
- Site en prod : https://theultimateclosers.com (Vercel)
- Supabase TUC-v2 : projet `llxgyomevketvypusafl`, 17 tables, 41 policies RLS
- **Migrations appliquées** : M1 `tuc_v2_vault_token_schema`, M2 `tuc_v2_vault_rbac_hardening`, M3 `tuc_v2_drop_permissive_insert_policies`, M4 `tuc_v2_revoke_rls_auto_enable_public`
- **Edge Functions ACTIVE** : `store-oauth-token`, `get-oauth-token`, `submit-call-booking`, `track-analytics`
- **0 advisors de sécurité Supabase** (tous résolus)
- **`src/lib/database.types.ts` à jour** (régénéré post-M1)
- **BLOCKERS résolus** : BLOCKER-001 (tokens OAuth → Vault chiffré), H8 (call_bookings rate-limited), H9 (site_analytics rate-limited), H10 (rls_auto_enable PUBLIC révoqué)
- **BLOCKERS ouverts** : BLOCKER-002 (enum app_role incohérent), BLOCKER-003 (auth.uid() non wrappé), BLOCKER-004 (has_role double signature), BLOCKER-005 (search_path SECURITY DEFINER) → tous liés à la migration baseline
- Repo inspiration : `D:\Hp\Telechargement\twenty-main\twenty-main` (Twenty CRM open-source — patterns transférables)
- ⚠️ **Action manuelle en attente** : rotation du token Upstash Redis `tuc-rate-limiting` (credentials partagés en chat lors de session 19 — à régénérer sur dashboard.upstash.com puis mettre à jour `.env` + Supabase Dashboard → Settings → Edge Function Secrets)

**Prochaine étape recommandée (à valider avec moi)** :
- **Option A** (sécurité) : attaquer BLOCKER-002 à 005 → migration baseline complète (enum app_role, auth.uid() wrappé, has_role unifié, search_path hardened)
- **Option B** (fonctionnel) : créer 5 skills Vague 3-4 manquants : `anthropic-prompt-engineering`, `big-five-personality`, `whisper-transcription`, `coaching-feedback-constructif`, `vercel-deployment-strategies`
- **Option C** (autre) : première invocation réelle d'un agent codeur — implémenter une feature produit

**Règles non-négociables (lecture obligatoire avant action)** :
- Règle d'or : ne JAMAIS déclarer une tâche terminée sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.
- Append-only sur `.claude/memory/` (seul `archiviste-memoire` écrit dedans, jamais d'autre agent).
- Fichiers protégés (CLAUDE.md, contracts.md, rules/*, docs/REFERENCE.md, docs/ARCHITECTURE.md, migrations appliquées, .env) = escalade explicite obligatoire.
- Pilier #1 valeurs : pas de dark pattern. Pilier #2 : pas d'envoi sans opt-in RGPD. Pilier #5 : pas de matching discriminatoire.
- Langue : français pour doc/produit/mémoire, anglais pour code/commits.

**Mon dossier de travail** : `D:\GitHub\the-ultimate-closers` (mounted en cowork).

Confirme que tu as bien lu les 5 fichiers et résume-moi en 5 lignes l'état du projet. Ensuite, on décide ensemble la prochaine action.

---

# Notes pour Nacer (à NE PAS copier dans le prompt)

- Tu peux switcher sans crainte. La nouvelle conversation aura le contexte essentiel via ce prompt + lecture des 5 fichiers (qui contiennent tout le savoir cumulé).
- Coût économisé : tu repars d'une session vide au lieu d'une session avec compression d'historique → divisé par 5-10 selon taille conversation actuelle.
- Si tu veux encore plus économiser : sélectionner modèle Sonnet 4.6 au lieu d'Opus pour les tâches de routine. Garder Opus pour décisions architecturales et matching-engine.
- Quand tu fais une session de plus de 2-3h, fais un `git commit` final pour figer l'état avant de switcher.
- **Upstash** : pense à régénérer le token avant la prochaine session (dashboard.upstash.com → tuc-rate-limiting → Reset Token → mettre à jour `.env` + Supabase secrets).
