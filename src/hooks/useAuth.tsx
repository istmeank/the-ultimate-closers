import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'closer' | 'owner' | 'client' | 'user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCloser, setIsCloser] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
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
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking user role:', error);
        // En cas d'erreur, définir le rôle par défaut 'user'
        setRole('user');
        setIsAdmin(false);
        setIsCloser(false);
        setIsOwner(false);
      } else {
        // Toujours définir un rôle (par défaut 'user' si aucun rôle n'est trouvé)
        const userRole = (data?.role as AppRole) || 'user';
        setRole(userRole);
        setIsAdmin(userRole === 'admin' || userRole === 'owner');
        setIsCloser(userRole === 'closer');
        setIsOwner(userRole === 'owner');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // En cas d'exception, définir le rôle par défaut 'user'
      setRole('user');
      setIsAdmin(false);
      setIsCloser(false);
      setIsOwner(false);
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


  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
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
    isAdmin,
    isCloser,
    isOwner,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
};
