import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Search, UserCog, UserMinus } from 'lucide-react';
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
import { BackToDashboardButton } from './BackToDashboardButton';

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

      // Load roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles.map((profile) => ({
        ...profile,
        roles: roles.filter((r) => r.user_id === profile.id).map((r) => r.role),
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
      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) throw error;
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      toast({
        title: 'Succès',
        description: hasRole
          ? `Rôle ${role} retiré`
          : `Rôle ${role} attribué`,
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
        <div className="flex items-center gap-4">
          <BackToDashboardButton />
          <div>
            <h2 className="font-playfair font-bold text-3xl text-background">
              Utilisateurs
            </h2>
            <p className="text-background/70 font-inter mt-1">
              Total: {users.length} utilisateurs
            </p>
          </div>
        </div>
        <CreateUserDialog onUserCreated={loadUsers} />
      </div>

      <Card className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6">
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
      </Card>
    </div>
  );
};
