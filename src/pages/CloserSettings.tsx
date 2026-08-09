import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CloserSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-primary dark:text-gold">Paramètres</h1>
        <p className="text-muted-foreground dark:text-white/70 mt-2">
          Gérez vos préférences et paramètres
        </p>
      </div>

      <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
        {/* Gradient background */}
        
        {/* Glow effect */}

        <CardHeader className="relative z-10">
          <CardTitle className="dark:text-gold">Paramètres du compte</CardTitle>
          <CardDescription className="dark:text-white/70">
            Configurez vos préférences de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-muted-foreground dark:text-white/70">
            Les paramètres seront bientôt disponibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloserSettings;
