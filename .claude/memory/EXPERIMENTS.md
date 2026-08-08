# EXPERIMENTS — Registre des expérimentations produit

> Chaque test, chaque variante, chaque hypothèse mesurée y entre.
> But : ne jamais oublier ce qu'on a essayé, ce qui a marché, ce qui n'a pas marché.

## Pourquoi ce registre
TUC est un produit qui doit apprendre vite. Sans registre des expérimentations, on retombe dans les mêmes ornières (mêmes scripts ratés, mêmes A/B inutiles, même matching biaisé). Avec, chaque essai construit la connaissance projet.

## Format d'une entrée

```
## EXP-001 — Titre court de l'expérience
- Date début : YYYY-MM-DD
- Date fin : YYYY-MM-DD (ou "en cours")
- Domaine : (acquisition / messagerie / matching / meet / onboarding / transverse)
- Hypothèse : "Si on fait X, alors Y se produira parce que Z."
- Méthode : protocole exact (variantes testées, sample, durée, baseline)
- Métriques suivies : (taux conversion, temps réponse, NPS, etc. — chiffrées)
- Résultat brut : (chiffres observés)
- Conclusion : hypothèse validée / invalidée / nuancée
- Décision : on adopte / on rejette / on itère (EXP-XXX-bis)
- Lien rapport complet : reports/experiments/EXP-001.md (si rapport détaillé)
- Lien LEARNING associé : LEARNING-XXX (si leçon générale extraite)
- Lien ADR : ADR-XXX (si la décision est structurante)
```

---

<!-- Première expérimentation à ajouter ici quand elle arrive -->
