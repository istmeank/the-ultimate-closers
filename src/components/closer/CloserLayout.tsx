import { ReactNode } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Calendar, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CloserLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: 'Pipeline',
    url: '/dashboard-closer',
    icon: LayoutDashboard,
  },
  {
    title: 'Mes Leads',
    url: '/dashboard-closer/leads',
    icon: Users,
  },
  {
    title: 'Agenda Google',
    url: '/dashboard-closer/calendar',
    icon: Calendar,
  },
  {
    title: 'Slack',
    url: '/dashboard-closer/slack',
    icon: MessageSquare,
  },
  {
    title: 'Profil',
    url: '/dashboard-closer/profile',
    icon: User,
  },
];

export const CloserLayout = ({ children }: CloserLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <Sidebar className="border-r border-primary/10">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="font-playfair text-lg text-primary">
              The Ultimate Closers
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.url)}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="px-2 py-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Connecté en tant que
                </div>
                <div className="text-sm font-medium text-primary mb-3">
                  {user?.email}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};