---
name: react-forms-i18n-a11y
description: Expertise complète pour coder formulaires (React Hook Form + Zod safeParse), internationalisation (i18next FR/AR/Darija + DziriBERT + RTL), et accessibilité (WCAG 2.1 AA, ARIA APG) pour TUC. Utilise systématiquement ce skill dès qu'il est question de formulaires lead capture, closer onboarding multi-step (WCAG 3.3.7 Redundant Entry), Zod schema TypeScript-first, React Hook Form Controller pour shadcn/ui, micro-copy non-punitive (WCAG 3.3.3 Error Suggestion), RTL pour arabe (DirectionProvider), lazy-loading namespaces i18next, focus visible WCAG 2.4.7, skip links 2.4.1, aria-live polite vs assertive WCAG 4.1.3, contrastes 4.5:1 / 3:1 large text, focus trap dialog, combobox listbox ARIA. Conformité éthique frontale TUC.
---


# **Synthèse Stratégique : Formulaires, Internationalisation et Accessibilité (TUC)**

En tant qu'Architecte Frontend Senior, je pose ici les jalons d'un cadre technique où l'excellence n'est pas une option mais un prérequis. Pour le projet TUC, ciblant les marchés nord-africains et la diaspora, la robustesse du code est le garant de notre éthique. Cette synthèse définit les standards normatifs pour transformer chaque interaction en un acte de confiance.

## **1\. Architecture Technique : React Hook Form \+ Zod**

L'architecture des formulaires TUC **mandate** une approche "TypeScript-first" absolue. Cette stratégie est vitale pour éradiquer la dette technique dès la phase de conception et garantir une intégrité totale des données circulant entre le client et l'API.

* **Validation Schema-First & Typage :** La définition des schémas via **Zod** est la source de vérité unique. L'utilisation de `z.infer` est obligatoire pour générer les types statiques, assurant une synchronisation parfaite entre validation et logique métier.  
* **Traitement des Erreurs :** Pour une robustesse maximale, l'architecture **exige** l'utilisation de `.safeParse()` (ou `.safeParseAsync()` pour les validations asynchrones comme la vérification de disponibilité de compte). Contrairement à `.parse()`, cette méthode retourne une **union discriminée**, permettant de traiter les succès et les erreurs de validation de manière exhaustive sans recourir à des blocs try/catch verbeux et fragiles.  
* **Intégration UI :** L'intégration avec `shadcn/ui` doit s'appuyer sur le composant `Form` de la bibliothèque. Pour tout composant externe contrôlé (ex: Calendar, Select, Combobox), l'implémentation du composant `Controller` de React Hook Form est **obligatoire** afin d'assurer une liaison bidirectionnelle propre entre l'UI et l'état du formulaire.  
* **Gestion d'État :** Le système doit impérativement gérer les `loading states` pour prévenir les soumissions multiples et déclencher un `reset` complet de l'état local après chaque succès confirmé.

**Transition :** Cette rigueur technique est le socle indispensable sur lequel repose la confiance des utilisateurs, particulièrement sur les marchés nord-africains où la fiabilité perçue est le premier levier d'adoption.

## **2\. Typologie et Patterns de Formulaires TUC**

La segmentation des formulaires par intention utilisateur est une décision architecturale qui réduit la charge cognitive et optimise les taux de conversion.

* **Lead Capture (DZ Market) :** Ces formulaires publics privilégient la friction minimale. Ils doivent intégrer des mécanismes anti-spam invisibles (honeypots) et une validation en temps réel légère pour ne pas décourager l'utilisateur.  
* **Closer Onboarding :** Ce parcours critique **doit** suivre un pattern multi-étapes (stepper). Pour respecter le critère de succès **WCAG 3.3.7 (Redundant Entry)**, toute information déjà saisie ou connue du système doit être auto-complétée ou mise à disposition de l'utilisateur pour sélection, évitant ainsi la double saisie pénible.  
* **Gestion de Profil et Filtres :** Pour les interfaces denses, l'usage de palettes de commande (Command) ou de sélecteurs complexes est prescrit, garantissant une navigation rapide et précise.

**Transition :** Une structure robuste est vaine sans une micro-copie qui guide l'utilisateur avec bienveillance plutôt que de le sanctionner.

## **3\. Micro-copie UX et Psychologie de l'Utilisateur**

La micro-copie est le quatrième pilier de notre éthique frontend. Elle doit transformer les barrières techniques en dialogues constructifs, influençant directement la rétention.

* **Validation Non-Punitive :** Conformément au critère **WCAG 3.3.3 (Error Suggestion)**, le système ne doit pas se contenter de signaler l'erreur. Les messages standards type "Champ requis" sont proscrits. Nous imposons des suggestions correctives : "Cette adresse email semble incomplète, pourriez-vous la vérifier ?".  
* **États de l'Interface :** La transparence est la règle. Chaque action doit être confirmée par des feedbacks de succès explicites (Toasts). Les `empty states` doivent systématiquement proposer une action alternative pour éviter les impasses utilisateur.

**Transition :** Cette communication doit rester limpide, quelle que soit la langue ou le sens de lecture choisi par l'utilisateur.

## **4\. Stratégie d'Internationalisation (i18n) Multi-niveaux**

Le multilinguisme (FR, AR, Darija) est au cœur de l'inclusion culturelle de TUC. Notre standard repose sur une implémentation avancée de `react-i18next`.

* **Optimisation des Performances :** Pour préserver la bande passante des utilisateurs en Algérie, l'architecture **impose le lazy-loading dynamique des namespaces** (`common`, `auth`, `dashboard`, `leads`). Seul le dictionnaire nécessaire au contexte actuel est chargé.  
* **Gestion du RTL (Right-To-Left) :** Le support de l'arabe nécessite l'injection systématique de l'attribut `dir="rtl"` sur l'élément racine. Cet état doit être piloté par un `DirectionProvider` global synchronisé avec le changement de langue dans i18n, adaptant ainsi logiquement l'ensemble du layout (miroir des icônes, marges et flux).  
* **Middleware Darija :** L'intégration de `DziriBERT` est prescrite comme une couche de **middleware logic** au sein du provider i18n. Ce modèle doit détecter les spécificités du Darija pour adapter dynamiquement la tonalité de la micro-copie et renforcer la proximité culturelle.

**Transition :** L'inclusion linguistique est le prolongement naturel de notre engagement pour une accessibilité technique universelle.

## **5\. Conformité WCAG 2.1 AA : L'Éthique en Code**

L'accessibilité est un pilier non négociable. Toute interface TUC doit répondre aux exigences du niveau AA du WCAG 2.1.

* **Perceptibilité et Contrastes (1.4.3) :** Le ratio de contraste standard **doit être de 4.5:1**. Toutefois, pour ne pas contraindre inutilement le design, une exception est tolérée pour le **texte large** (18pt ou 14pt bold), où le ratio minimum est fixé à **3:1**. Les logotypes n'ont aucune exigence de contraste.  
* **Utilisabilité au Clavier (2.1.1) :** Toute fonctionnalité doit être opérable sans souris. Cela implique un **focus visible (2.4.7)** systématique, renforcé par un indicateur à haut contraste, et l'implémentation de **skip links (2.4.1)** pour bypasser les blocs de navigation répétitifs.  
* **Sémantique HTML (1.3.1) :** L'association entre `<label>` et contrôles de formulaire doit être programmatique et stricte.

**Transition :** Ces fondations sémantiques sont enrichies par des patterns ARIA pour les composants interactifs complexes.

## **6\. Implémentation des Patterns ARIA Critiques**

L'usage d'ARIA est réservé à l'enrichissement de l'expérience là où le HTML natif atteint ses limites.

* **Combobox et Listbox :** L'implémentation doit suivre scrupuleusement les patterns APG (ARIA Authoring Practices) pour la gestion des sélections et de la navigation par flèches.  
* **Dialog et Sheet :** La gestion du **focus trap** (confinement du focus dans la modale) est une exigence absolue. Chaque dialogue doit être référencé via `aria-labelledby`.  
* **Alertes et Messages de Statut (4.1.3) :** Nous distinguons techniquement deux types de retours :  
  * **aria-live="assertive" / role="alert"** : Pour les erreurs critiques nécessitant une attention immédiate.  
  * **aria-live="polite" / role="status"** : Pour les messages de succès ou mises à jour de statut ne devant pas interrompre le flux du lecteur d'écran.

**Transition :** La validation finale du produit s'appuie sur la checklist opérationnelle suivante.

## **7\. Checklist d'Excellence : 12 Points de Contrôle**

| Catégorie | Point de Contrôle | Critère de Succès (WCAG/TUC) |
| :---- | :---- | :---- |
| **Validation** | Zod `safeParse` | Retour d'union discriminée sans bloc try/catch. |
| **Technique** | shadcn/ui Wrapper | Utilisation systématique de `Controller` pour les inputs complexes. |
| **Visuel** | Contrastes Textes | 4.5:1 (Standard) / 3:1 (Large Text \>18pt) (WCAG 1.4.3). |
| **Visuel** | Focus Visible | Indicateur de focus non-ambigu et non-supprimé (WCAG 2.4.7). |
| **Langue** | Support RTL Dynamique | Injection de `dir="rtl"` via state global et DirectionProvider. |
| **Langue** | Performance i18n | Lazy-loading des namespaces par domaine (Auth, Dashboard). |
| **Sémantique** | Info & Relationships | Association explicite `<label>` et `id` d'input (WCAG 1.3.1). |
| **Clavier** | Navigation sans souris | Parcours logique des formulaires sans "Keyboard Trap" (WCAG 2.1.1). |
| **UX** | Suggestion d'Erreur | Micro-copie proposant une correction textuelle (WCAG 3.3.3). |
| **Localisation** | Middleware Darija | Intégration de DziriBERT pour l'adaptation contextuelle. |
| **ARIA** | Statut vs Alerte | Distinction entre `aria-live="polite"` et `"assertive"` (WCAG 4.1.3). |
| **Robustesse** | Saisie Redondante | Auto-population des données précédemment fournies (WCAG 3.3.7). |

Le strict respect de ce framework garantit que chaque application déployée sous l'égide de TUC répond aux standards les plus élevés d'éthique frontale, de performance et d'inclusion universelle.

