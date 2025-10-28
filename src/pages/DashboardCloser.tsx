import { CloserLayout } from '@/components/closer/CloserLayout';
import { StatsCards } from '@/components/closer/StatsCards';
import { KanbanBoard } from '@/components/closer/KanbanBoard';

const DashboardCloser = () => {
  return (
    <CloserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-playfair text-3xl text-primary">Pipeline Closers</h1>
          <div className="text-sm text-muted-foreground">
            Gestion de vos leads et rendez-vous
          </div>
        </div>
        
        <StatsCards />
        <KanbanBoard />
      </div>
    </CloserLayout>
  );
};

export default DashboardCloser;