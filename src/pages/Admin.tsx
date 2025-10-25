import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { FormationsManager } from '@/components/admin/FormationsManager';
import { UsersManager } from '@/components/admin/UsersManager';
import { Analytics } from '@/components/admin/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, FileEdit, GraduationCap, Users, BarChart3 } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AdminLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-background/10 backdrop-blur-sm border border-secondary/20 mb-8">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Contenu
          </TabsTrigger>
          <TabsTrigger
            value="formations"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Formations
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            <Users className="w-4 h-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>

        <TabsContent value="content">
          <ContentEditor />
        </TabsContent>

        <TabsContent value="formations">
          <FormationsManager />
        </TabsContent>

        <TabsContent value="users">
          <UsersManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Admin;
