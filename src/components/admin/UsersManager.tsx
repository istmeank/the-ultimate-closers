import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Search, UserCog, UserMinus, Trash2 } from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const UsersManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Load roles via edge function (bypass RLS safely)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session invalide. Veuillez vous reconnecter.');

      const { data: resp, error: rolesError } = await supabase.functions.invoke('list-user-roles', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (rolesError) throw rolesError;
      const roles = (resp as any)?.roles ?? [];

      const usersWithRoles = profiles.map((profile) => ({
        ...profile,
        roles: roles.filter((r: any) => r.user_id === profile.id).map((r: any) => r.role),
      }));

      setUsers(usersWithRoles);
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

  const toggleRole = async (userId: string, role: 'admin' | 'closer', hasRole: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
        return;
      }

      const action = hasRole ? 'remove' : 'add';
      const { error } = await supabase.functions.invoke('manage-user-role', {
        body: { userId, role, action },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: hasRole ? `Rôle ${role} retiré` : `Rôle ${role} attribué`,
      });
      
      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    try {
      // Verify session before calling the function
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
        return;
      }

      console.log('🔐 Session token present:', !!session.access_token);
      console.log('🔐 Token preview:', session.access_token.substring(0, 20) + '...');

      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      console.log('✅ Delete user response:', data);

      toast({
        title: 'Utilisateur supprimé',
        description: `${email} a été supprimé avec succès`,
      });
      
      loadUsers();
    } catch (error: any) {
      console.error('❌ Delete user error:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-background font-inter">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair font-bold text-3xl text-background">
            Utilisateurs
          </h2>
          <p className="text-background/70 font-inter mt-1">
            Total: {users.length} utilisateurs
          </p>
        </div>
        <CreateUserDialog onUserCreated={loadUsers} />
      </div>

      <Card className="group relative overflow-hidden bg-background/95 backdrop-blur-sm border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-scale p-6">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(233,196,106,0.15),transparent_70%)]" />

        <div className="relative z-10">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par email ou nom..."
                className="pl-10"
              />
            </div>
          </div>

          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isOwner = user.roles.includes('owner');
                const isAdmin = user.roles.includes('admin');
                const isCloser = user.roles.includes('closer');
                const isUser = user.roles.includes('user');
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {isOwner && (
                          <Badge className="bg-purple-500 text-white">Owner</Badge>
                        )}
                        {isAdmin && (
                          <Badge className="bg-secondary text-primary">Admin</Badge>
                        )}
                        {isCloser && (
                          <Badge className="bg-blue-500 text-white">Closer</Badge>
                        )}
                        {isUser && (
                          <Badge variant="outline">User</Badge>
                        )}
                        {user.roles.length === 0 && (
                          <Badge variant="secondary">Aucun rôle</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {!isOwner && (
                          <>
                            <Button
                              onClick={() => toggleRole(user.id, 'admin', isAdmin)}
                              variant={isAdmin ? 'destructive' : 'outline'}
                              size="sm"
                            >
                              {isAdmin ? (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-1" />
                                  Retirer admin
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-1" />
                                  Promouvoir admin
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => toggleRole(user.id, 'closer', isCloser)}
                              variant={isCloser ? 'destructive' : 'outline'}
                              size="sm"
                            >
                              {isCloser ? (
                                <>
                                  <UserMinus className="w-4 h-4 mr-1" />
                                  Retirer closer
                                </>
                              ) : (
                                <>
                                  <UserCog className="w-4 h-4 mr-1" />
                                  Promouvoir closer
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Supprimer
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.email}</strong> ?
                                    Cette action est irréversible et supprimera toutes les données associées.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(user.id, user.email)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer définitivement
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {isOwner && (
                          <Badge variant="secondary" className="text-xs">
                            Protégé
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );
};
