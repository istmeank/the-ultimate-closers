# 🔗 Intégration DziriBERT - Guide d'utilisation

## 📋 Vue d'ensemble

DziriBERT a été intégré dans "the Ultimate Closers" pour offrir des suggestions de texte en dialecte algérien (Darija). Cette fonctionnalité permet de compléter automatiquement des phrases ou de suggérer des mots manquants.

## 🚀 Démarrage rapide

### 1. Démarrer l'API DziriBERT

L'API doit être démarrée séparément. Ouvrez un terminal dans le répertoire du modèle DziriBERT :

```bash
cd C:\Users\HP\.cache\huggingface\hub\models--alger-ia--dziribert\snapshots\4722886048b304627caaeed800733e6376f5d13d
python dziribert_api.py
```

L'API sera disponible sur `http://localhost:8000`

### 2. Configuration (optionnel)

Si l'API tourne sur un autre port/URL, créez un fichier `.env.local` à la racine du projet :

```env
VITE_DZIRIBERT_API_URL=http://localhost:8000
```

### 3. Utilisation dans votre application

#### Utiliser le composant prêt à l'emploi :

```tsx
import { DziriBERTSuggestions } from '@/components/DziriBERTSuggestions';

function MyComponent() {
  return (
    <DziriBERTSuggestions
      placeholder="Entrez votre phrase avec [MASK]..."
      onSelect={(completed) => {
        console.log('Texte complété:', completed);
      }}
    />
  );
}
```

#### Utiliser le hook directement :

```tsx
import { useDziriBERT } from '@/hooks/useDziriBERT';

function MyComponent() {
  const { predict, complete, suggest, loading } = useDziriBERT();

  const handlePredict = async () => {
    const result = await predict("tahya el [MASK]", 5);
    if (result) {
      console.log('Prédictions:', result.predictions);
    }
  };

  return (
    <button onClick={handlePredict} disabled={loading}>
      Prédire
    </button>
  );
}
```

## 📁 Fichiers créés

### 1. Service (`src/lib/dziribert.ts`)
- Fonctions pour interagir avec l'API DziriBERT
- `predictDarija()` : Faire une prédiction
- `completePhrase()` : Compléter automatiquement une phrase
- `getSuggestions()` : Obtenir des suggestions
- `checkDziriBERTHealth()` : Vérifier la disponibilité de l'API

### 2. Hook React (`src/hooks/useDziriBERT.tsx`)
- Hook personnalisé pour utiliser DziriBERT dans les composants React
- Gestion automatique de l'état (loading, error, isAvailable)
- Fonctions : `predict`, `complete`, `suggest`, `checkAvailability`

### 3. Composant UI (`src/components/DziriBERTSuggestions.tsx`)
- Composant React prêt à l'emploi avec interface utilisateur
- Affiche les suggestions avec scores
- Boutons pour utiliser ou copier les suggestions
- Gestion automatique de `[MASK]`

### 4. Page de démo (`src/pages/DziriBERTDemo.tsx`)
- Page de démonstration de l'intégration
- Accessible via une route (à ajouter dans `App.tsx`)

## 🔌 Intégration dans le chatbot existant

Pour ajouter DziriBERT dans le chatbot de qualification, modifiez `ChatbotConversation.tsx` :

```tsx
import { DziriBERTSuggestions } from './DziriBERTSuggestions';

// Dans step === 1, après le Textarea :
{step === 1 && (
  <div className="space-y-4">
    <h4 className="font-semibold text-lg">Quel est votre objectif principal ?</h4>
    <Textarea
      {...register('objective')}
      placeholder="Décrivez votre objectif en détail..."
      className="min-h-[120px]"
    />
    {/* Ajouter DziriBERT ici */}
    <DziriBERTSuggestions
      placeholder="Besoin d'aide ? Tapez votre phrase avec [MASK]..."
      onSelect={(completed) => setValue('objective', completed)}
    />
    {errors.objective && (
      <p className="text-sm text-red-500">{errors.objective.message}</p>
    )}
  </div>
)}
```

## 📝 Exemples d'utilisation

### Exemple 1 : Suggestions simples

```tsx
import { DziriBERTSuggestions } from '@/components/DziriBERTSuggestions';

<DziriBERTSuggestions />
```

### Exemple 2 : Avec callback

```tsx
<DziriBERTSuggestions
  onSelect={(completed) => {
    // Utiliser le texte complété
    setFormValue('message', completed);
  }}
/>
```

### Exemple 3 : Utilisation du hook pour logique personnalisée

```tsx
import { useDziriBERT } from '@/hooks/useDziriBERT';

function CustomComponent() {
  const { predict, loading } = useDziriBERT();
  const [suggestions, setSuggestions] = useState([]);

  const handleInput = async (text: string) => {
    if (text.includes('[MASK]')) {
      const result = await predict(text, 3);
      if (result) {
        setSuggestions(result.predictions);
      }
    }
  };

  return (
    // Votre UI personnalisée
  );
}
```

## 🎯 Cas d'usage

1. **Complétion de formulaires** : Aider les utilisateurs à compléter des champs texte
2. **Suggestions dans le chatbot** : Améliorer l'expérience utilisateur avec des suggestions contextuelles
3. **Correction automatique** : Proposer des corrections pour le darija
4. **Aide à la rédaction** : Suggérer des mots appropriés selon le contexte

## ⚙️ API Reference

### `predictDarija(request: DziriBERTRequest)`

Faire une prédiction avec DziriBERT.

**Paramètres :**
- `text` (string) : Texte avec `[MASK]`
- `top_k` (number, optionnel) : Nombre de prédictions (défaut: 5)
- `normalize` (boolean, optionnel) : Normaliser le texte (défaut: true)

**Retourne :** `Promise<DziriBERTResponse>`

### `useDziriBERT()`

Hook React pour utiliser DziriBERT.

**Retourne :**
- `predict(text: string, topK?: number)` : Faire une prédiction
- `complete(text: string)` : Compléter une phrase
- `suggest(text: string, topK?: number)` : Obtenir des suggestions
- `checkAvailability()` : Vérifier la disponibilité
- `loading` : État de chargement
- `error` : Erreur éventuelle
- `isAvailable` : Disponibilité de l'API

## 🐛 Dépannage

### L'API n'est pas disponible

1. Vérifiez que l'API DziriBERT est démarrée : `http://localhost:8000/health`
2. Vérifiez la variable d'environnement `VITE_DZIRIBERT_API_URL`
3. Vérifiez les logs de la console pour les erreurs CORS

### Erreur CORS

Si vous rencontrez des erreurs CORS, ajoutez dans `dziribert_api.py` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez vos domaines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Les suggestions ne s'affichent pas

1. Vérifiez que le texte contient `[MASK]` (sera ajouté automatiquement sinon)
2. Vérifiez la console pour les erreurs
3. Testez directement l'API : `http://localhost:8000/docs`

## 📚 Ressources

- [Documentation DziriBERT originale](../README.md)
- [API Documentation](http://localhost:8000/docs)
- [Paper DziriBERT](https://arxiv.org/pdf/2109.12346.pdf)

## ✅ Checklist d'intégration

- [x] Service DziriBERT créé (`src/lib/dziribert.ts`)
- [x] Hook React créé (`src/hooks/useDziriBERT.tsx`)
- [x] Composant UI créé (`src/components/DziriBERTSuggestions.tsx`)
- [x] Page de démo créée (`src/pages/DziriBERTDemo.tsx`)
- [ ] Variable d'environnement configurée (optionnel)
- [ ] Route ajoutée dans `App.tsx` pour la page de démo (optionnel)
- [ ] Intégration dans le chatbot (optionnel)
- [ ] API DziriBERT démarrée

---

**🎉 DziriBERT est maintenant intégré dans votre projet !**

Pour tester, démarrez l'API DziriBERT et utilisez le composant `<DziriBERTSuggestions />` où vous en avez besoin.

