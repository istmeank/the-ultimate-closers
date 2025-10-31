import { StatsCards } from '@/components/closer/StatsCards';
import { KanbanBoard } from '@/components/closer/KanbanBoard';
import handshakeImage from '@/assets/hero-handshake.jpg';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardCloser = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Header avec image de poignée de main */}
      <div className="relative rounded-lg overflow-hidden">
        <img 
          src={handshakeImage} 
          alt={t('closer.title')}
          className="w-full h-48 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center px-8">
          <div>
            <h1 className="font-playfair text-4xl text-background font-bold drop-shadow-lg">
              {t('closer.title')}
            </h1>
            <p className="text-background/90 mt-2 font-inter text-lg">
              {t('closer.subtitle')}
            </p>
          </div>
        </div>
      </div>
      
      <StatsCards />
      <KanbanBoard />
    </div>
  );
};

export default DashboardCloser;
