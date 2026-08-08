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
  Target,
  Share2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type AppRole = 'admin' | 'closer' | 'owner' | 'client' | 'user' | 'developer';

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
  },
  {
    icon: Share2,
    label: 'HubSpot',
    href: '/dashboard-closer/hubspot',
    roles: ['closer', 'admin', 'owner', 'developer']
  }
];

export const UnifiedSidebar = () => {
  const { userRoles } = useAuth();
  const { t } = useLanguage();

  const sidebarItemsWithLabels: ExtendedSidebarItem[] = [
    { icon: LayoutDashboard, label: t('admin.nav.dashboard'), href: '/admin', roles: ['admin', 'owner'], prominent: true },
    { icon: FileEdit, label: t('admin.nav.content'), href: '/admin/content', roles: ['admin', 'owner'] },
    { icon: GraduationCap, label: t('admin.nav.formations'), href: '/admin/formations', roles: ['admin', 'owner'] },
    { icon: Users, label: t('admin.nav.users'), href: '/admin/users', roles: ['admin', 'owner'] },
    { icon: Target, label: t('admin.nav.closers'), href: '/admin/closers', roles: ['admin', 'owner'] },
    { icon: BarChart3, label: t('admin.nav.analytics'), href: '/admin/analytics', roles: ['admin', 'owner'] },
    { icon: LayoutDashboard, label: t('closer.nav.pipeline'), href: '/dashboard-closer', roles: ['closer', 'admin', 'owner'] },
    { icon: Users, label: t('closer.nav.leads'), href: '/dashboard-closer/leads', roles: ['closer', 'admin', 'owner'] },
    { icon: Calendar, label: t('closer.nav.calendar'), href: '/dashboard-closer/calendar', roles: ['closer', 'admin', 'owner'] },
    { icon: MessageSquare, label: t('closer.nav.slack'), href: '/dashboard-closer/slack', roles: ['closer', 'admin', 'owner'] },
    { icon: User, label: t('closer.nav.profile'), href: '/dashboard-closer/profile', roles: ['closer', 'admin', 'owner'] },
    { icon: Settings, label: t('closer.nav.settings'), href: '/dashboard-closer/settings', roles: ['closer', 'admin', 'owner'] },
    { icon: Share2, label: 'HubSpot', href: '/dashboard-closer/hubspot', roles: ['closer', 'admin', 'owner', 'developer'] }
  ];

  const visibleItems = sidebarItemsWithLabels.filter(item => 
    item.roles.some(requiredRole => userRoles.includes(requiredRole))
  );

  const adminItems = visibleItems.filter(i => i.href.startsWith('/admin'));
  const closerItems = visibleItems.filter(i => i.href.startsWith('/dashboard-closer'));

  return (
    <Sidebar collapsible="icon" className="bg-[hsl(167,69%,18%)] border-r border-gold/10">
      <SidebarContent className="pt-20">
        {/* Section Admin */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gold font-semibold">
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
                                ? 'bg-gold/30 text-gold border-2 border-gold shadow-[0_0_20px_hsl(44,73%,66%/0.6)] font-bold'
                                : 'bg-gold/10 text-gold border border-gold/50 hover:bg-gold/20 hover:shadow-[0_0_15px_hsl(44,73%,66%/0.4)] font-semibold'
                              : isActive
                                ? 'bg-gold/20 text-gold border-l-4 border-gold shadow-[0_0_15px_hsl(44,73%,66%/0.4)]'
                                : 'text-gold/70 hover:text-gold hover:bg-gold/10'
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
            <SidebarGroupLabel className="text-gold font-semibold">
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
                              ? 'bg-gold/20 text-gold border-l-4 border-gold shadow-[0_0_15px_hsl(44,73%,66%/0.4)]'
                              : 'text-gold/70 hover:text-gold hover:bg-gold/10'
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
