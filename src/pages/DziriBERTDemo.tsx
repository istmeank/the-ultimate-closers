import { DziriBERTSuggestions } from '@/components/DziriBERTSuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DziriBERTDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 dark:text-gold">DziriBERT - Assistant Darija</h1>
          <p className="text-muted-foreground dark:text-white/70">
            Prédiction et complétion de texte en dialecte algérien (Darija)
          </p>
        </div>

        <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

          <CardHeader className="relative z-10">
            <CardTitle className="dark:text-gold">Comment utiliser DziriBERT</CardTitle>
            <CardDescription className="dark:text-white/70">
              Entrez une phrase avec [MASK] pour obtenir des suggestions de mots
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold dark:text-white">Exemples :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground dark:text-white/70">
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

        <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

          <CardHeader className="relative z-10">
            <CardTitle className="dark:text-gold">À propos de DziriBERT</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-2 text-sm text-muted-foreground dark:text-white/70">
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

