---
name: upstash-rate-limiting
description: Expertise complète pour durcir les endpoints publics INSERT de TUC (BLOCKER H8/H9 - call_bookings + site_analytics WITH CHECK true). Utilise systématiquement ce skill dès qu'il est question de algorithme Sliding Window (vs Fixed Window vulnérable aux boundary attacks, Token Bucket, Leaky Bucket), Upstash Redis serverless connectionless HTTP (vs Redis TCP), Ratelimit.slidingWindow(N, "1m"), double check IP + Email (anti VPN distribué + anti rotation comptes), hiérarchie Cloudflare Turnstile en premier filtre gratuit (préserve quota 10k cmd/jour Upstash) puis Upstash, retry-after header delta-seconds, microcopy erreur non technique professionnelle, monitoring rate limit hit/miss + P99 latency, alerting 80% quota Upstash. Anti-patterns incluant rate limit côté client, hardcoded secrets, absence retry-after, fuite stack technique dans 429. Résout BLOCKER H8/H9 avec stratégie multi-endpoint (signup 5/h, password_reset 3/h email, call_bookings 3/min IP).
---


## **1\. Analyse Comparative des Algorithmes de Limitation de Débit**

Dans l'écosystème TUC (The Urban Collective), la sécurisation des endpoints n'est pas une simple commodité technique, mais un pilier de la viabilité économique. Une protection défaillante expose nos infrastructures à une saturation critique de la base de données et, surtout, à une dérive exponentielle des coûts liés aux services d'IA (BLOCKER H8/H9). Le choix de l'algorithme est le premier rempart contre ces risques.

### **Synthèse des concepts fondamentaux**

* **Fixed Window (Fenêtre Fixe) :** Découpe le temps en segments rigides (ex: 1 minute). Bien que simple, il souffre du "problème de bordure" : un attaquant peut doubler son quota en injectant des requêtes à la fin d'une fenêtre et au début de la suivante (ex: 59s et 01s), contournant ainsi la limite réelle.  
* **Sliding Window (Fenêtre Glissante) :** Calcule le débit sur une fenêtre temporelle mobile. C'est l'évolution logique qui résout le problème de bordure en lissant la vérification sur le temps réel.  
* **Token Bucket (Seau à Jetons) :** Un réservoir de jetons se remplit à un rythme fixe. Il autorise des "bursts" (pics) de trafic tant que le réservoir contient des jetons, offrant une flexibilité pour les usages humains.  
* **Leaky Bucket (Seau Percé) :** Force un débit de sortie constant, peu importe le débit d'entrée. Idéal pour protéger des systèmes legacy rigides, mais peut pénaliser l'expérience utilisateur par une latence forcée.

Pour TUC, l'algorithme **Sliding Window** est la recommandation architecturale. En neutralisant les "boundary attacks" (attaques de bordure), il garantit une précision absolue dans la détection du spam de bots, protégeant ainsi nos ressources IA les plus coûteuses. L'implémentation de cette logique à l'échelle mondiale repose sur la robustesse de l'infrastructure Upstash.

## **2\. Infrastructure Upstash Redis : L'Avantage du Serverless et de l'Edge**

Le maintien d'un "State" (état) partagé est le défi majeur du rate limiting global. Les fonctions Edge (Deno/Vercel) étant par nature éphémères et sans état (stateless), elles ne peuvent stocker localement les compteurs de requêtes. Sans une base de données de "State" distribuée, une attaque pourrait être invisible si elle est répartie sur plusieurs points de présence mondiaux.

Upstash Redis s'impose comme la solution de référence pour TUC grâce à des attributs techniques critiques :

* **Cohérence Globale (Global Consistency) :** Un hit détecté sur un nœud à Tokyo est immédiatement synchronisé pour une fonction Edge s'exécutant à Paris.  
* **Modèle Connectionless (HTTP) :** Contrairement au Redis standard basé sur TCP, Upstash utilise une interface HTTP. Cela élimine les goulots d'étranglement liés aux limites de connexions TCP sur les runtimes Deno et Vercel Edge.  
* **Fiabilité "Enterprise-Ready" :** La bibliothèque `ratelimit-js` est officiellement en **Stade GA (General Availability)** et bénéficie du **Support Professionnel Upstash**, garantissant une stabilité indispensable pour nos opérations.  
* **Architecture Stateless Native :** Pas de gestion complexe de sockets persistants, ce qui réduit la latence P99 et simplifie la scalabilité.

Le setup initial (10 000 commandes/jour) offre une marge confortable, tandis que l'accès HTTP résout les problématiques de latence inhérentes aux bases de données traditionnelles dans un flux d'exécution serverless.

## **3\. Implémentation Technique : Intégration Deno & Edge Function**

Pour corriger la vulnérabilité RLS `WITH CHECK (true)`, la validation doit impérativement intervenir avant tout accès à la base de données. L'architecture logicielle doit suivre une hiérarchie stricte : Validation du Token Turnstile \-\> Contrôle de débit Upstash \-\> Exécution métier.

### **Bloc de Code : Edge Function `call_bookings` (Deno)**

```ts
import { Ratelimit } from "npm:@upstash/ratelimit";
import { Redis } from "npm:@upstash/redis";

// Initialisation connectionless pour environnement Edge
const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 requêtes / min
  analytics: true,
});

export default async function handler(req: Request) {
  const { email, turnstileToken } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "anonymous";

  // 1. PRIORITÉ : Validation Cloudflare Turnstile (Filtre gratuit/passif)
  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
  const turnstileResult = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${turnstileSecret}&response=${turnstileToken}`,
  });
  
  const turnstileData = await turnstileResult.json();
  if (!turnstileData.success) {
    return new Response(JSON.stringify({ error: "Échec de validation anti-bot." }), { status: 403 });
  }

  // 2. Rate Limiting Upstash (Double vérification IP & Email)
  // Note : Consomme 2 unités de quota pour une protection maximale
  const [ipRes, emailRes] = await Promise.all([
    ratelimit.limit(`limit_ip_${ip}`),
    ratelimit.limit(`limit_email_${email}`)
  ]);

  if (!ipRes.success || !emailRes.success) {
    const resetTimestamp = Math.max(ipRes.reset, emailRes.reset);
    const retryAfterSeconds = Math.ceil((resetTimestamp - Date.now()) / 1000);

    return new Response(
      JSON.stringify({ error: "Trop de demandes. Accès temporairement restreint." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterSeconds.toString(), // Format delta-seconds pour clients robustes
        },
      }
    );
  }

  // 3. Forward vers la Database (Succès)
  return new Response(JSON.stringify({ status: "success" }), { status: 200 });
}
```

### **Guide de Microcopy d'Erreur**

Le message ne doit pas être une fuite d'information technique.

* **Recommandation :** *"Trop de tentatives. Pour garantir la sécurité de votre compte, l'accès est temporairement restreint. Veuillez réessayer dans quelques instants."* (Professionnel pour l'humain, neutre pour le bot).

## **4\. Matrice de Stratégies par Endpoint TUC**

| Endpoint | Identifiant (Clé) | Limite Autorisée | Justification Stratégique |
| :---- | :---- | :---- | :---- |
| `call_bookings` | IP / Email | 3 req/min (IP) / 1 req/min (Email) | Protection critique contre le spam et les coûts IA (H8/H9). |
| `site_analytics` | IP / Global | 100 req/min (IP) / 1000 req/h (Global) | Évite le déni de service (DoS) sur le collecteur de données. |
| `signup` | IP | 5 req/h (IP) | Prévention de la création de comptes fantômes et attaques par dictionnaire. |
| `password_reset` | Email | 3 req/h (Email) | Protection contre l'énumération de comptes et le harcèlement par email. |

La dualité **IP / Email** est fondamentale : elle bloque les attaques distribuées par VPN (même email, IPs multiples) et les attaques par rotation de comptes (même IP, emails multiples).

## **5\. Protection de Seconde Ligne : Cloudflare Turnstile**

Déjà intégré via `VITE_TURNSTILE_SITE_KEY`, Turnstile agit comme un filtre anti-bot non intrusif. Son rôle architectural est crucial pour l'optimisation des coûts : en validant le token Turnstile **avant** d'interroger Upstash Redis, nous filtrons la majorité du trafic automatisé sans consommer nos 10 000 crédits quotidiens Upstash, ni solliciter nos modèles d'IA.

## **6\. Monitoring et Observabilité du Trafic**

Le succès de cette stratégie repose sur l'analyse itérative :

* **Rate Limit Hit vs Miss :** Un taux de "Hit" (bloqué) anormalement élevé sur un endpoint spécifique indique une tentative d'attaque en cours.  
* **Latence P99 :** Surveillance de l'impact du check Redis sur l'expérience utilisateur finale (cible \< 50ms).  
* **Dashboard Upstash :** Utilisation des graphiques en temps réel pour configurer des alertes de consommation de quota, évitant toute interruption de service pour les utilisateurs légitimes.

## **7\. Analyse des Anti-Patterns à Proscrire**

Une sécurité illusoire ("Security by Obscurity") est plus dangereuse qu'une absence de protection. Évitez absolument :

1. **Rate limit côté client :** N'importe quel script Python ou commande `curl` contourne instantanément cette barrière. La logique doit être souveraine sur le serveur.  
2. **Hardcoded Secrets :** Le `VITE_TURNSTILE_SITE_KEY` est public par design, mais la **Secret Key** de validation doit impérativement rester dans les variables d'environnement cryptées du runtime Edge.  
3. **Absence de Header Retry-After :** Ne pas fournir ce header dégrade l'UX et peut impacter négativement le SEO, car les crawlers légitimes ne savent pas quand revenir.  
4. **Fuite de Stack Technique :** Ne jamais nommer "Upstash" ou "Redis" dans vos messages d'erreur HTTP 429 pour ne pas faciliter la reconnaissance de l'attaquant.

## **8\. Checklist de Validation (8 Points)**

* \[ \] **Variables d'environnement :** `UPSTASH_REDIS_REST_URL`, `TOKEN` et `TURNSTILE_SECRET_KEY` configurés.  
* \[ \] **Algorithme Sliding Window :** Testé pour bloquer les attaques de bordure (boundary attacks).  
* \[ \] **Hiérarchie de filtrage :** Turnstile validé en priorité absolue pour préserver le quota Redis.  
* \[ \] **Persistance du State :** Vérification de la synchronisation entre différentes régions Edge.  
* \[ \] **Conformité HTTP 429 :** Présence systématique du header `Retry-After` en delta-seconds.  
* \[ \] **Gestion du Quota :** Alerting configuré à 80% des 10 000 commandes/jour sur Upstash.  
* \[ \] **CORS & Headers :** Validation des en-têtes pour les appels inter-domaines en environnement Edge.  
* \[ \] **Audit de Logs :** Analyse hebdomadaire pour ajuster les seuils et réduire les faux positifs.

