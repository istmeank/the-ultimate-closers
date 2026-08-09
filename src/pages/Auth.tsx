import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import logo from '@/assets/logo.webp';
import handshake from '@/assets/hero-handshake.jpg';
import LanguageSelector from '@/components/LanguageSelector';
import DebugInfo from '@/components/DebugInfo';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const emailSchema = z.string().email('Email invalide').refine(
  (email) => email.endsWith('@theultimateclosers.com'),
  'Seuls les emails professionnels @theultimateclosers.com sont autorisés'
);
const passwordSchema = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères');

const Auth = () => {
  const { user, role, isAdmin, isCloser, isOwner, loading, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Redirection uniquement après action de connexion explicite
  useEffect(() => {
    if (shouldRedirect && user && !loading && role !== null) {
      if (isAdmin || isOwner) {
        navigate('/admin');
      } else if (isCloser) {
        navigate('/dashboard-closer');
      } else {
        navigate('/');
      }
    }
  }, [shouldRedirect, user, role, isAdmin, isOwner, isCloser, loading, navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShouldRedirect(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { error } = await signInWithEmail(email, password);
      if (error) {
        setShouldRedirect(false);
        toast({
          title: t('auth.error.title'),
          description: error.message === 'Invalid login credentials' 
            ? t('auth.error.credentials')
            : error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      setShouldRedirect(false);
      if (err instanceof z.ZodError) {
        toast({
          title: t('auth.error.validation'),
          description: err.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${handshake})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Voile de la charte plutôt qu'un HSL écrit en dur — suit le thème. */}
        <div
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{ background: 'var(--gradient-veil)' }}
        />
      </div>

      {/* Debug Info */}
      <DebugInfo />
      
      {/* Theme Toggle & Language Selector - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-surface-1/97 backdrop-blur-sm border-hairline shadow-raised animate-fade-in">
        <div className="p-8 space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="The Ultimate Closers Logo" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="font-display font-bold text-3xl text-ink-strong">
              {t('auth.title')}
            </h1>
            <p className="font-inter text-muted-foreground">
              {t('auth.subtitle')}
            </p>
            <p className="font-inter text-sm text-muted-foreground">
              {t('auth.contact')}
            </p>
          </div>

          {/* Auth Form */}
          <div className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">{t('auth.email')}</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="votreemail@theultimateclosers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">{t('auth.password')}</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-6 text-base font-semibold shadow-soft transition-colors"
              >
                {isSubmitting ? t('auth.signingIn') : t('auth.signin')}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground font-inter mt-4">
            {t('auth.reserved')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
