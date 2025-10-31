import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  Settings,
  FileEdit,
  GraduationCap,
  BarChart3,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LucideIcon } from 'lucide-react';

type AppRole = 'admin' | 'closer' | 'owner' | 'client' | 'user';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: AppRole[];
}

interface ExtendedSidebarItem extends SidebarItem {
  prominent?: boolean;
}

const sidebarItems: ExtendedSidebarItem[] = [
  // Items Admin/Owner
  {
    icon: LayoutDashboard,
    label: 'Dashboard Admin',
    href: '/admin',
    roles: ['admin', 'owner'],
    prominent: true // Item mis en avant
  },
  {
    icon: FileEdit,
    label: 'Contenu',
    href: '/admin/content',
    roles: ['admin', 'owner']
  },
  {
    icon: GraduationCap,
    label: 'Formations',
    href: '/admin/formations',
    roles: ['admin', 'owner']
  },
  {
    icon: Users,
    label: 'Utilisateurs',
    href: '/admin/users',
    roles: ['admin', 'owner']
  },
  {
    icon: Target,
    label: 'Closers',
    href: '/admin/closers',
    roles: ['admin', 'owner']
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    href: '/admin/analytics',
    roles: ['admin', 'owner']
  },
  // Items Closer
  {
    icon: LayoutDashboard,
    label: 'Pipeline Closer',
    href: '/dashboard-closer',
    roles: ['closer', 'admin', 'owner']
  },
  {
    icon: Users,
    label: 'Mes Leads',
    href: '/dashboard-closer/leads',
    roles: ['closer', 'admin', 'owner']
  },
  {
    icon: Calendar,
    label: 'Agenda',
    href: '/dashboard-closer/calendar',
    roles: ['closer', 'admin', 'owner']
  },
  {
    icon: MessageSquare,
    label: 'Slack',
    href: '/dashboard-closer/slack',
    roles: ['closer', 'admin', 'owner']
  },
  {
    icon: User,
    label: 'Profil',
    href: '/dashboard-closer/profile',
    roles: ['closer', 'admin', 'owner']
  },
  {
    icon: Settings,
    label: 'Paramètres',
    href: '/dashboard-closer/settings',
    roles: ['closer', 'admin', 'owner']
  }
];

export const UnifiedSidebar = () => {
  const { userRoles } = useAuth();

  // Filtrer les items selon les rôles de l'utilisateur
  const visibleItems = sidebarItems.filter(item => 
    item.roles.some(requiredRole => userRoles.includes(requiredRole))
  );

  // Regroupement par section
  const adminItems = visibleItems.filter(i => i.href.startsWith('/admin'));
  const closerItems = visibleItems.filter(i => i.href.startsWith('/dashboard-closer'));

  return (
    <Sidebar collapsible="icon" className="bg-primary border-r border-primary-foreground/10">
      <SidebarContent className="pt-20">
        {/* Section Admin */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-secondary font-semibold">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        end={item.href === '/admin'}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                            item.prominent
                              ? isActive
                                ? 'bg-secondary/30 text-secondary border-2 border-secondary shadow-[0_0_20px_hsl(44,73%,66%/0.6)] font-bold'
                                : 'bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary/20 hover:shadow-[0_0_15px_hsl(44,73%,66%/0.4)] font-semibold'
                              : isActive
                                ? 'bg-secondary/20 text-secondary border-l-4 border-secondary shadow-[0_0_15px_hsl(44,73%,66%/0.4)]'
                                : 'text-primary-foreground/70 hover:text-secondary hover:bg-secondary/10'
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Section Closer */}
        {closerItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-secondary font-semibold">
              Closer Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {closerItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
