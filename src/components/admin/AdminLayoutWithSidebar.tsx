import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UnifiedSidebar } from '@/components/shared/UnifiedSidebar';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import handshake from '@/assets/hero-handshake.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      <div className="flex min-h-screen w-full relative">
        {/* Background Image avec overlay vert */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${handshake})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-[hsl(167,69%,18%)]/60 dark:bg-[hsl(167,69%,10%)]/90 backdrop-blur-sm" />
        </div>

        {/* Header avec accent vert */}
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-secondary/90 backdrop-blur-sm border-b border-secondary/30 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-white hover:text-secondary-foreground" />
            <img 
              src={logo} 
              alt="Logo" 
              className="w-8 h-8 object-contain" 
            />
            <h1 className="font-playfair text-xl font-bold text-white">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/90 font-inter">
              {user?.email}
            </span>
            <ThemeToggle />
            <LanguageSelector className="scale-90" />
            <RoleSwitcher />
            <Button
              onClick={handleSignOut}
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('closer.logout')}
            </Button>
          </div>
        </header>

        <UnifiedSidebar />
        
        <main className="flex-1 pt-14 p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
