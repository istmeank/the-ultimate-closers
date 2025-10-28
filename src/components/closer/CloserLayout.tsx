import { ReactNode } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
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
  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: 'Pipeline',
      href: '/dashboard-closer',
      isActive: true
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
    <div className="flex min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <Sidebar>
        <div className="p-4">
          <h2 className="font-playfair text-xl font-bold text-primary mb-6">
            Dashboard Closer
          </h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  item.isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </Sidebar>
      
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};
