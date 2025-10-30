import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, useSidebar } from '@/components/ui/sidebar';
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

const SidebarNav = () => {
  const { open: collapsed } = useSidebar();
  const location = useLocation();

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
    <SidebarContent>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-xl font-bold text-primary">
            {!collapsed && 'Dashboard Closer'}
          </h2>
          <SidebarTrigger />
        </div>
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
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </SidebarContent>
  );
};

export const CloserLayout = ({ children }: CloserLayoutProps) => {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/5 to-secondary/5">
        <Sidebar collapsible="icon">
          <SidebarNav />
        </Sidebar>
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
