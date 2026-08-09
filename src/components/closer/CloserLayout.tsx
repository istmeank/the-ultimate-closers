import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider, 
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  Settings,
  LogOut,
  Home,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.webp';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

interface CloserLayoutProps {
  children?: ReactNode;
}

export const CloserLayout = ({ children }: CloserLayoutProps) => {
  const { user, signOut, userRoles } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Vérifier si l'utilisateur est owner uniquement
  const isOwner = userRoles.includes('owner');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header avec accent doré subtil */}
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent backdrop-blur-sm border-b border-secondary/20 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <img 
              src={logo} 
              alt="Logo" 
              className="w-8 h-8 object-contain hover:drop-shadow-[0_0_10px_hsl(44,73%,66%/0.6)] transition-all" 
            />
            <h1 className="font-display text-xl font-bold bg-gradient-to-r from-primary via-secondary/80 to-primary bg-clip-text text-transparent">
              Dashboard Closer
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-inter">
              {user?.email}
            </span>
            <LanguageSelector className="scale-90" />
            {isOwner && (
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary hover:shadow-[0_0_15px_hsl(44,73%,66%/0.4)] transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard Admin
              </Button>
            )}
            <RoleSwitcher />
            <Button
              onClick={handleSignOut}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('closer.logout')}
            </Button>
          </div>
        </header>

        <CloserSidebarContent />
        
        <main className="flex-1 pt-14 p-8">
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  );
};

const CloserSidebarContent = () => {
  const { t } = useLanguage();
  const { open } = useSidebar();
  
  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: t('closer.nav.pipeline'),
      href: '/dashboard-closer'
    },
    {
      icon: Users,
      label: t('closer.nav.leads'),
      href: '/dashboard-closer/leads'
    },
    {
      icon: Calendar,
      label: t('closer.nav.calendar'),
      href: '/dashboard-closer/calendar'
    },
    {
      icon: Building2,
      label: 'HubSpot CRM',
      href: '/dashboard-closer/hubspot'
    },
    {
      icon: MessageSquare,
      label: t('closer.nav.slack'),
      href: '/dashboard-closer/slack'
    },
    {
      icon: User,
      label: t('closer.nav.profile'),
      href: '/dashboard-closer/profile'
    },
    {
      icon: Settings,
      label: t('closer.nav.settings'),
      href: '/dashboard-closer/settings'
    }
  ];

  return (
    <Sidebar collapsible="icon" className="bg-secondary dark:bg-primary border-r border-primary-foreground/10">
      <SidebarContent>
        <SidebarGroup className="pt-20">
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      end={item.href === '/dashboard-closer'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-primary/20 text-primary border-l-4 border-primary dark:bg-secondary/20 dark:text-secondary dark:border-secondary'
                            : 'text-secondary-foreground/90 hover:text-primary hover:bg-primary/10 dark:text-primary-foreground/70 dark:hover:text-secondary dark:hover:bg-secondary/10'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {open && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};