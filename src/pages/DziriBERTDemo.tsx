import { DziriBERTSuggestions } from '@/components/DziriBERTSuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DziriBERTDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">DziriBERT - Assistant Darija</h1>
          <p className="text-muted-foreground">
            Prédiction et complétion de texte en dialecte algérien (Darija)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comment utiliser DziriBERT</CardTitle>
            <CardDescription>
              Entrez une phrase avec [MASK] pour obtenir des suggestions de mots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Exemples :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 py-0.5 rounded">tahya el [MASK]</code> - Suggestions pour compléter la phrase</li>
                <li><code className="bg-muted px-1 py-0.5 rounded">rabi [MASK] khouya</code> - Prédiction dans un contexte personnel</li>
                <li><code className="bg-muted px-1 py-0.5 rounded">أنا من الجزائر من ولاية [MASK]</code> - Support des caractères arabes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <DziriBERTSuggestions
          placeholder="Entrez votre phrase avec [MASK]..."
          onSelect={(completed) => {
            console.log('Texte complété:', completed);
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>À propos de DziriBERT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              DziriBERT est le premier modèle Transformer pré-entraîné spécifiquement pour le dialecte algérien.
              Il peut prédire des mots manquants dans des textes écrits en caractères latins ou arabes.
            </p>
            <p>
              Le modèle est entraîné sur plus d'un million de tweets algériens et peut reconnaître
              les variantes d'écriture courantes du darija.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

