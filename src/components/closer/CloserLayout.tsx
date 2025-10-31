import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface CloserLayoutProps {
  children?: ReactNode;
}

export const CloserLayout = ({ children }: CloserLayoutProps) => {
  const { user, signOut, userRoles } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Vérifier si l'utilisateur est admin ou owner
  const isAdminOrOwner = userRoles.includes('admin') || userRoles.includes('owner');

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
            <h1 className="font-playfair text-xl font-bold bg-gradient-to-r from-primary via-secondary/80 to-primary bg-clip-text text-transparent">
              Dashboard Closer
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-inter">
              {user?.email}
            </span>
            {isAdminOrOwner && (
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
              className="bg-secondary text-primary hover:bg-secondary/90 hover:shadow-[0_0_20px_hsl(44,73%,66%/0.5)] transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </header>

        <SidebarContent />
        
        <main className="flex-1 pt-14 p-8">
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  );
};

const SidebarContent = () => {
  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: 'Pipeline',
      href: '/dashboard-closer'
    },
    {
      icon: Users,
      label: 'Mes Leads',
      href: '/dashboard-closer/leads'
    },
    {
      icon: Calendar,
      label: 'Agenda Google',
      href: '/dashboard-closer/calendar'
    },
    {
      icon: MessageSquare,
      label: 'Slack',
      href: '/dashboard-closer/slack'
    },
    {
      icon: User,
      label: 'Profil',
      href: '/dashboard-closer/profile'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      href: '/dashboard-closer/settings'
    }
  ];

  return (
    <Sidebar collapsible="icon" className="bg-primary border-r border-primary-foreground/10">
      <div className="p-4 pt-20">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard-closer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-secondary/20 text-secondary border-l-4 border-secondary shadow-[0_0_15px_hsl(44,73%,66%/0.4)]'
                    : 'text-primary-foreground/70 hover:text-secondary hover:bg-secondary/10'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </Sidebar>
  );
};
