# SUGGESTIONS.md — TUC tech (append-only)

> Registre des suggestions remontées par les agents vers l'orchestrateur.
> **Seul l'archiviste-memoire écrit ici.** L'auditeur-qualite récolte ce registre périodiquement et produit une synthèse. L'orchestrateur ne lit pas ce fichier directement — il reçoit la synthèse de l'auditeur.
>
> Pierre 19 du Squelette Silicate v0.6 — Agent souverain : droit de suggérer.

## Format d'une suggestion

```markdown
## SGT-XXX — [nom-agent] → [destinataire] — [date]
**Domaine concerné** : [mon pôle | autre pôle — lequel]
**Observation** : [ce que j'ai constaté dans mon travail]
**Suggestion** : [ce que je propose]
**Justification** : [pourquoi cela améliorerait la situation]
**Urgence** : [haute | normale | basse]
**Je n'applique pas** : cette suggestion attend validation de [orchestrateur | Nacer].
**Statut** : [en attente | évalué | adopté | écarté]
```

---

<!-- Première suggestion à ajouter ici -->

## SUGGESTION — 2026-07-25 — Mécanisme de propagation des leçons entre entités sœurs

**Émetteur** : archiviste-memoire (session 33)

**Constat** : LULG tech a résolu le problème des diffs CRLF massifs et l'a capitalisé en `LEARNING-004`. TUC tech a le même problème, non résolu, et 265 fichiers pollués (cf. BLOCKER-009). Les deux dépôts sont gouvernés par le même squelette Silicate, mais rien ne fait circuler une leçon de l'un vers l'autre.

**Suggestion** : ajouter au squelette Silicate un registre partagé au niveau de l'incubateur — par exemple `SILICATE INCUBATEUR/docs/LEARNINGS-RESEAU.md` — où remontent les leçons transverses, celles qui ne dépendent ni du langage ni du domaine (outillage Git, conventions de fins de ligne, pièges de gabarit shadcn, pratiques AEO). Chaque entité y puiserait à son bootstrap.

**Non appliquée** — relève d'une décision de Nacer sur le squelette Silicate, hors périmètre d'un dépôt.
