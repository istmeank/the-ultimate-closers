import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, House, PanelLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.webp';
import LanguageSelector from '@/components/LanguageSelector';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface CloserLayoutProps {
  children: ReactNode;
}

export const CloserLayout = ({ children }: CloserLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-primary/30 backdrop-blur-sm border-b border-secondary/20 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-7 w-7" />
            <img 
              src={logo} 
              alt="Logo" 
              className="w-8 h-8 object-contain hover:drop-shadow-[0_0_10px_hsl(44,73%,66%/0.6)] transition-all" 
            />
            <h1 className="font-playfair text-xl font-bold bg-gradient-to-r from-primary via-secondary/80 to-primary bg-clip-text text-transparent">
              Dashboard Closer
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground dark:text-background/80 font-inter">
              {user?.email}
            </span>
            <LanguageSelector className="bg-background/10 dark:bg-primary/20" />
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-border dark:border-primary/30 text-foreground dark:text-background hover:bg-muted dark:hover:bg-primary/20 rounded-full scale-90"
            >
              <House className="w-4 h-4 mr-2" />
              Dashboard Admin
            </Button>
            <Button
              onClick={handleSignOut}
              className="bg-secondary text-primary hover:bg-secondary/90 hover:shadow-[0_0_20px_hsl(44,73%,66%/0.5)] transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-14 p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

