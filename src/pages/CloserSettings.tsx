import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CloserSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl text-primary">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos préférences et paramètres
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres du compte</CardTitle>
          <CardDescription>
            Configurez vos préférences de travail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Les paramètres seront bientôt disponibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloserSettings;
