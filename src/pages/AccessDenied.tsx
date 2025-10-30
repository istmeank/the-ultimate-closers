import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isCloser, isOwner } = useAuth();

  const handleRedirect = () => {
    if (!user) {
      navigate('/auth');
    } else if (isAdmin || isOwner) {
      navigate('/admin');
    } else if (isCloser) {
      navigate('/dashboard-closer');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90 p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="font-playfair text-3xl text-primary">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>

        {user ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connecté en tant que : <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <Button onClick={handleRedirect} className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Retour à ma page d'accueil
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vous devez être connecté pour accéder à cette ressource.
            </p>
            <Button onClick={handleRedirect} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </Button>
          </div>
        )}

        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccessDenied;
