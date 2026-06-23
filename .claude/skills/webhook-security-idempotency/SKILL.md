---
name: webhook-security-idempotency
description: Expertise complète pour sécuriser tous les webhooks entrants et sortants de TUC (Stripe paiements, HubSpot sync, WhatsApp status, Telegram updates, Meta Graph + notifs closer sortantes). Utilise systématiquement ce skill dès qu'il est question de HMAC SHA256 verification (X-Hub-Signature-256, Stripe-Signature), anti-replay (timestamp ±5min tolérance), idempotency key dans table webhooks_processed (UNIQUE constraint), pattern Edge Function receiver (verify HMAC → check timestamp → check idempotency_key → réponse 200 < 5s → enqueue async traitement), exponential backoff 2^n max 5 retries sur webhooks sortants, dead letter queue table errored_webhooks (à créer TUC) avec dashboard réessai manuel + alerting Slack > 10 erreurs/h. Anti-patterns incluant pas de HMAC, traitement sync long timeout, pas idempotency, retry sans backoff, pas DLQ, secrets en clair, pas de logs.
---


Dans un écosystème distribué où TUC interagit avec des plateformes comme Stripe, HubSpot et Meta, la gestion des webhooks ne peut se limiter à une simple réception de données. En tant qu'architectes, nous devons traiter chaque webhook entrant comme une requête potentiellement hostile. Ce document définit les standards de sécurité et de résilience pour garantir l'intégrité de nos flux financiers et de synchronisation.

## **1\. Authentification par HMAC : Pilier de l'Intégrité et de l'Identité**

L'authentification par **HMAC (Hash-based Message Authentication Code)** est le mécanisme non négociable pour prévenir l'usurpation d'identité (*anti-impersonation*). Dans l'écosystème TUC, cela garantit que les événements de paiement (Stripe) ou les mises à jour de leads (HubSpot) proviennent exclusivement de l'émetteur légitime.

### **Analyse Stratégique**

Contrairement aux secrets partagés transmis "en clair" dans les headers (vulnérables à l'interception), le HMAC utilise une clé secrète pour signer le corps de la requête.

* **Intégrité Totale** : Le mécanisme SHA256 combine le *payload* brut avec le secret. Toute modification d'un seul bit dans le corps du message invalidera la signature.  
* **Confidentialité du Secret** : Le secret n'est jamais transmis sur le réseau. Seul le *hash* (la signature) circule, rendant l'interception inutile pour un attaquant souhaitant forger de nouveaux messages.

### **Implémentation Technique (Deno/Edge)**

Une implémentation robuste doit impérativement utiliser le corps brut (*raw body*) et traiter les headers complexes (comme ceux de Stripe qui combinent timestamp et signatures).

```ts
/**
 * Valide une signature HMAC-SHA256 pour les services type Stripe/TUC
 * @param rawBody - Le Uint8Array du corps de la requête (ne pas parser en JSON avant)
 * @param signatureHeader - Le header complet (ex: "t=149...,v1=525...,v0=...")
 * @param secret - La clé secrète stockée en environnement
 */
async function verifyTucWebhook(
  rawBody: Uint8Array, 
  signatureHeader: string, 
  secret: string
): Promise<boolean> {
  // 1. Extraction du timestamp (t) et de la signature v1
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.split('='))
  );
  const timestamp = parts['t'];
  const signatureV1 = parts['v1'];

  if (!timestamp || !signatureV1) return false;

  // 2. Préparation du payload signé (Timestamp + . + Body)
  const encoder = new TextEncoder();
  const signedPayload = encoder.encode(`${timestamp}.${new TextDecoder().decode(rawBody)}`);
  
  // 3. Import de la clé cryptographique
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["verify"]
  );

  // 4. Comparaison en temps constant (Anti-timing attack)
  const sigBytes = hexToUint8Array(signatureV1);
  return await crypto.subtle.verify("HMAC", key, sigBytes, signedPayload);
}

function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}
```

*La validation d'identité est vaine si un attaquant peut rejouer une transaction valide. La validation temporelle est notre second rempart.*

## **2\. Protection contre le Rejeu (Anti-Replay) et Validation Temporelle**

La protection contre le rejeu empêche un attaquant de capturer un webhook valide et de le soumettre à nouveau pour déclencher une action multiple (ex: créditer deux fois un compte).

### **Directives de Mise en Œuvre**

* **Validation du Timestamp** : Le récepteur doit extraire le timestamp du header (le `t` validé par HMAC) et le comparer à l'heure système.  
* **Fenêtre de Tolérance** : Une marge de **±5 minutes** est prescrite pour absorber les latences réseau.  
* **ATTENTION (Zero Tolerance)** : N'utilisez jamais une valeur de tolérance de `0`. Selon les standards de sécurité (notamment Stripe), une valeur de 0 désactive totalement la vérification de récence, ouvrant une faille critique.  
* **Synchronisation Horloge** : Sur les plateformes Edge (Supabase, Vercel), la synchronisation NTP est gérée par le fournisseur. Vérifiez les politiques de dérive (*clock drift*) du provider pour garantir que la fenêtre de 5 minutes reste fiable.

*L'idempotence garantit qu'un événement, même s'il passe les filtres de sécurité, n'est exécuté qu'une seule fois en base de données.*

## **3\. Clés d'Idempotence : Garantir l'Exécution Unique**

L'idempotence est vitale pour les opérations financières de TUC. Elle assure que si Stripe renvoie trois fois le même événement `invoice.paid` à cause d'une instabilité réseau, le client n'est facturé qu'une seule fois.

### **Architecture de Données**

Nous imposons la création d'une table de persistance `webhooks_processed` :

* **Structure** : `idempotency_key` (PK), `status_code`, `response_body`, `processed_at`.  
* **Contrainte UNIQUE** : L'ID de l'événement (fourni par le sender) doit être verrouillé via une contrainte d'unicité.

### **Gestion Stratégique des Conflits**

TUC adopte une stratégie de "Mirroring" :

1. Si la clé existe déjà, **ne traitez pas le message**.  
2. Renvoyez le code HTTP et le corps de réponse stockés lors de la *première* exécution réussie.  
3. Cette approche (200 OK avec le résultat original) garantit que les systèmes émetteurs cessent leurs tentatives tout en maintenant une cohérence parfaite de l'état côté TUC.

## **4\. Pattern Edge Function : Structure du Récepteur de Webhooks**

Le pattern Edge Function est privilégié pour sa capacité à absorber les pics de charge et à répondre avant les seuils de timeout des émetteurs.

### **Flux de Traitement Séquentiel**

1. **Vérification HMAC & IP Allowlisting** : Rejet immédiat si l'origine ou l'intégrité est douteuse.  
2. **Validation Temporelle** : Rejet si le message a plus de 5 minutes.  
3. **Vérification d'Idempotence** : Consultation de `webhooks_processed`.  
4. **Réponse Immédiate (HTTP 200\)** : Doit être envoyée en moins de **5 secondes**.  
5. **Analyse de Type d'Événement** :  
   * **Snapshot Events** : Payload complet inclus. Enfilement direct pour traitement asynchrone.  
   * **Thin Events** : Payload minimal. L'ouvrier asynchrone devra effectuer un callback API vers le fournisseur pour récupérer les données complètes avant traitement.  
6. **Enfilement (Enqueue)** : Transfert vers une file d'attente (Queue) pour exécution des processus métier.

## **5\. Stratégie de Retry et Backoff Exponentiel (Webhooks Sortants)**

Pour les notifications sortantes vers les closers, la résilience est assurée par un mécanisme de repli.

### **Modélisation Mathématique**

L'algorithme de **backoff exponentiel** évite de saturer un serveur de destination qui redémarre (effet *Thundering Herd*) :

* **Algorithme** : 2^n secondes.  
* **Séquence** : 1s, 2s, 4s, 8s, 16s.  
* **Limite** : 5 tentatives maximum.

**Note de l'Architecte** : Cette fenêtre de retry est courte (\~31 secondes au total). Elle est optimisée pour des micro-coupures. Pour toute panne dépassant cette durée, le système s'appuie sur la couche de récupération suivante : la DLQ.

## **6\. Gestion des Échecs : Dead Letter Queue (DLQ) et Alerting**

La DLQ est le sous-système de continuité d'activité de TUC. Elle garantit qu'aucune donnée financière n'est perdue.

### **Spécifications du Sous-système de Récupération**

* **Table `errored_webhooks`** : Persistance du payload brut, des headers et de la trace d'erreur complète après l'échec de la 5ème tentative.  
* **Dashboard de Remédiation** : Interface permettant le rejeu manuel après correction d'un bug applicatif ou rétablissement d'un service tiers.

### **Alerting Critique**

Un monitoring proactif est configuré via Slack/PagerDuty :

* **Seuil d'Alerte** : Déclenchement immédiat si le taux d'erreur dépasse **10 erreurs par heure**. Ce seuil permet d'ignorer le "bruit" réseau tout en capturant les régressions de code ou les pannes majeures.

## **7\. Analyse des Anti-Patterns à Proscrire**

| Anti-Pattern | Impact sur le système TUC |
| :---- | :---- |
| **Absence de HMAC** | Injection de fausses transactions ; usurpation de l'identité des fournisseurs. |
| **Traitement synchrone** | Timeouts émetteurs provoquant des retries infinis et une surcharge CPU. |
| **Tolérance temporelle \= 0** | Désactivation accidentelle de la sécurité anti-rejeu. |
| **Secrets en clair** | Compromission totale des clés en cas d'accès au repo ou aux logs. |
| **Idempotence sans stockage** | Doublons de facturation et corruption des stocks/données. |
| **Retry sans Backoff** | Aggravation d'une panne mineure en crash total (DoS involontaire). |
| **R依赖 unique sur HMAC** | Risque de Single Point of Failure. Nécessite IP Allowlisting (Defense in Depth). |

## **8\. Checklist de Conformité (10 Points)**

* \[ \] Secret HMAC stocké dans un gestionnaire de secrets (Vault/Env) et jamais en clair.  
* \[ \] Validation HMAC effectuée sur le corps de requête **brut** (Uint8Array).  
* \[ \] Parsing correct du header de signature (extraction de `t` et `v1`).  
* \[ \] Rejet systématique des requêtes hors de la fenêtre de ±5 minutes.  
* \[ \] Validation que la tolérance temporelle est strictement positive (≠ 0).  
* \[ \] Utilisation d'une table d'idempotence stockant la réponse initiale (Status \+ Body).  
* \[ \] Réponse HTTP 200 renvoyée systématiquement avant tout traitement lourd (\>5s).  
* \[ \] Distinction logique implémentée entre *Thin* et *Snapshot* events.  
* \[ \] IP Allowlisting activé au niveau Firewall ou Middleware pour les sources connues.  
* \[ \] Alerte Slack active pour les échecs persistants en table `errored_webhooks`.

