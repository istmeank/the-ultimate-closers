import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UnifiedSidebar } from '@/components/shared/UnifiedSidebar';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export const AdminLayoutWithSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header avec accent doré subtil */}
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-gradient-to-r from-secondary/15 via-primary/90 to-primary/95 backdrop-blur-sm border-b border-secondary/30 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-background hover:text-secondary" />
            <img 
              src={logo} 
              alt="Logo" 
              className="w-8 h-8 object-contain hover:drop-shadow-[0_0_10px_hsl(44,73%,66%/0.6)] transition-all" 
            />
            <h1 className="font-playfair text-xl font-bold bg-gradient-to-r from-background via-secondary/80 to-background bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-background/90 font-inter">
              {user?.email}
            </span>
            <LanguageSelector className="scale-90" />
            <RoleSwitcher />
            <Button
              onClick={handleSignOut}
              className="bg-secondary text-primary hover:bg-secondary/90 hover:shadow-[0_0_20px_hsl(44,73%,66%/0.5)] transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('closer.logout')}
            </Button>
          </div>
        </header>

        <UnifiedSidebar />
        
        <main className="flex-1 pt-14 p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
