import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'closer' | 'owner' | 'client' | 'user' | 'developer';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCloser, setIsCloser] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener pour les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Vérifier le rôle utilisateur avec setTimeout pour éviter le deadlock
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setIsAdmin(false);
          setIsCloser(false);
          setIsOwner(false);
          setLoading(false);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking user role:', error);
        // En cas d'erreur, définir le rôle par défaut 'user'
        setRole('user');
        setUserRoles(['user']);
        setIsAdmin(false);
        setIsCloser(false);
        setIsOwner(false);
      } else {
      // Récupérer tous les rôles de l'utilisateur
      const roles = data.map(r => r.role as AppRole);
      const allRoles: AppRole[] = roles.length > 0 ? roles : ['user'];
      
      // Determine primary role based on hierarchy: owner > admin > developer > closer > user
      let primaryRole: AppRole = 'user';
      
      if (roles.includes('owner')) {
        primaryRole = 'owner';
      } else if (roles.includes('admin')) {
        primaryRole = 'admin';
      } else if (roles.includes('developer')) {
        primaryRole = 'developer';
      } else if (roles.includes('closer')) {
        primaryRole = 'closer';
      }

      setRole(primaryRole);
      setUserRoles(allRoles);
      setIsAdmin(allRoles.includes('admin'));
      setIsCloser(allRoles.includes('closer'));
      setIsOwner(allRoles.includes('owner'));
      setIsDeveloper(allRoles.includes('developer'));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // En cas d'exception, définir le rôle par défaut 'user'
      setRole('user');
      setUserRoles(['user']);
      setIsAdmin(false);
      setIsCloser(false);
      setIsOwner(false);
      setIsDeveloper(false);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    role,
    userRoles,
    isAdmin,
    isCloser,
    isOwner,
    isDeveloper,
    loading,
    signInWithEmail,
    signOut,
  };
};
