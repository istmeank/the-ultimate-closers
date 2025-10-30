import { useAuth } from '@/hooks/useAuth';

/**
 * Composant de debug pour afficher les informations de rôle utilisateur
 * À utiliser uniquement en développement
 */
export const UserRoleDebug = () => {
  const { user, role, isAdmin, isCloser, isOwner, loading } = useAuth();

  // Ne pas afficher en production
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg max-w-xs z-50">
      <h3 className="font-bold text-sm mb-2 text-primary">🔍 User Role Debug</h3>
      <div className="space-y-1 text-xs font-mono">
        <div>
          <span className="text-muted-foreground">Loading:</span>{' '}
          <span className={loading ? 'text-yellow-500' : 'text-green-500'}>
            {loading ? 'true' : 'false'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">User ID:</span>{' '}
          <span className="text-foreground">{user?.id ? `${user.id.substring(0, 8)}...` : 'null'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Email:</span>{' '}
          <span className="text-foreground">{user?.email || 'null'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Role:</span>{' '}
          <span className="text-foreground font-bold">{role || 'null'}</span>
        </div>
        <div className="pt-2 border-t border-border mt-2">
          <div className="flex gap-2 flex-wrap">
            {isAdmin && <span className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded">Admin</span>}
            {isCloser && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded">Closer</span>}
            {isOwner && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded">Owner</span>}
            {!isAdmin && !isCloser && !isOwner && role && (
              <span className="px-2 py-0.5 bg-gray-500/20 text-gray-500 rounded">{role}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
