import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { authService } from '@/lib/services/auth.service';

export const CreateUserDialog = ({ onUserCreated }: { onUserCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<string[]>(['user']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleRole = (role: string) => {
    setRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation côté client
      if (!email.endsWith('@theultimateclosers.com')) {
        toast({
          title: 'Erreur',
          description: 'L\'email doit être un email @theultimateclosers.com',
          variant: 'destructive',
        });
        return;
      }

      if (password.length < 8) {
        toast({
          title: 'Erreur',
          description: 'Le mot de passe doit contenir au moins 8 caractères',
          variant: 'destructive',
        });
        return;
      }

      // Création via le service d'authentification (gère la session + Edge Function)
      await authService.createUser({
        email,
        password,
        fullName,
        roles: roles.length > 0 ? roles : ['user'],
      });

      toast({ title: 'Succès', description: `Utilisateur ${email} créé avec succès` });

      // Réinitialiser le formulaire
      setEmail('');
      setFullName('');
      setPassword('');
      setRoles(['user']);
      setOpen(false);
      onUserCreated();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Créer utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            Créer un nouvel utilisateur
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="utilisateur@theultimateclosers.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Doit être un email @theultimateclosers.com
            </p>
          </div>

          <div>
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jean Dupont"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe temporaire *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground mt-1">
              L'utilisateur devra le changer à sa première connexion
            </p>
          </div>

          <div className="space-y-2">
            <Label>Rôles *</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-admin"
                  checked={roles.includes('admin')}
                  onCheckedChange={() => toggleRole('admin')}
                />
                <label
                  htmlFor="role-admin"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Admin (accès complet)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-closer"
                  checked={roles.includes('closer')}
                  onCheckedChange={() => toggleRole('closer')}
                />
                <label
                  htmlFor="role-closer"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Closer (gestion des leads)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-user"
                  checked={roles.includes('user')}
                  onCheckedChange={() => toggleRole('user')}
                />
                <label
                  htmlFor="role-user"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  User (accès basique)
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
