import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'admin' | 'closer' | 'owner' | 'client' | 'user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: AppRole;
}

export const ProtectedRoute = ({ children, requireAdmin = false, requireRole }: ProtectedRouteProps) => {
  const { user, role, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          <p className="text-background font-inter">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  if (requireRole && role !== requireRole && !isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
