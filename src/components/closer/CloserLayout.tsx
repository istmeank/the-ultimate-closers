import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
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
  Settings
} from 'lucide-react';

interface CloserLayoutProps {
  children: ReactNode;
}

export const CloserLayout = ({ children }: CloserLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header avec bouton de toggle */}
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 bg-background/80 backdrop-blur-sm border-b z-40">
          <SidebarTrigger className="mr-4" />
          <h1 className="font-playfair text-xl font-bold text-primary">
            Dashboard Closer
          </h1>
        </header>

        <SidebarContent />
        
        <main className="flex-1 pt-14 p-8">
          {children}
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
    <Sidebar collapsible="icon">
      <div className="p-4 pt-20">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard-closer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
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
