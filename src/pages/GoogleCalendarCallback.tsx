import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const GoogleCalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Erreur lors de la connexion à Google Calendar');
        navigate('/dashboard-closer/calendar');
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } = await supabase.functions.invoke('google-calendar-auth', {
            body: { action: 'exchange_code', code }
          });

          if (exchangeError) {
            throw exchangeError;
          }

          toast.success('Google Calendar connecté avec succès!');
          navigate('/dashboard-closer/calendar');
        } catch (err) {
          console.error('Error exchanging code:', err);
          toast.error('Erreur lors de la connexion');
          navigate('/dashboard-closer/calendar');
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connexion à Google Calendar...</p>
      </div>
    </div>
  );
};
