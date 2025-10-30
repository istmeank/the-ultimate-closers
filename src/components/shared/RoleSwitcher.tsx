import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCog, Check } from 'lucide-react';

type AppRole = 'admin' | 'closer' | 'owner' | 'client' | 'user';

export const RoleSwitcher = () => {
  const { userRoles } = useAuth();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Récupérer le rôle actif depuis localStorage ou utiliser le premier rôle
    const stored = localStorage.getItem('activeRole') as AppRole;
    if (stored && userRoles.includes(stored)) {
      setActiveRole(stored);
    } else if (userRoles.length > 0) {
      setActiveRole(userRoles[0] as AppRole);
      localStorage.setItem('activeRole', userRoles[0]);
    }
  }, [userRoles]);

  // Ne pas afficher si l'utilisateur n'a qu'un seul rôle
  if (userRoles.length <= 1) {
    return null;
  }

  const handleSwitchRole = (role: AppRole) => {
    setActiveRole(role);
    localStorage.setItem('activeRole', role);
    
    // Rediriger vers le dashboard approprié
    if (role === 'owner' || role === 'admin') {
      navigate('/admin');
    } else if (role === 'closer') {
      navigate('/dashboard-closer');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Owner',
      admin: 'Admin',
      closer: 'Closer',
      user: 'User',
      client: 'Client',
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      owner: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      admin: 'bg-secondary/20 text-secondary border-secondary/50',
      closer: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      user: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    };
    return classes[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`border ${getRoleBadgeClass(activeRole || userRoles[0])}`}
        >
          <UserCog className="w-4 h-4 mr-2" />
          {getRoleLabel(activeRole || userRoles[0])}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {userRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleSwitchRole(role as AppRole)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{getRoleLabel(role)}</span>
              {role === activeRole && (
                <Check className="w-4 h-4 text-secondary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
