import { StatsCards } from '@/components/closer/StatsCards';
import { KanbanBoard } from '@/components/closer/KanbanBoard';
import handshakeImage from '@/assets/hero-handshake.jpg';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardCloser = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Bandeau — la poignée de main du logo, voilée pour rester un fond et non un sujet. */}
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-hairline">
        <img
          src={handshakeImage}
          alt=""
          aria-hidden="true"
          className="h-32 w-full object-cover object-center md:h-36"
        />
        <div
          className="absolute inset-0 flex items-center px-6 md:px-8"
          style={{ background: 'var(--gradient-veil)' }}
        >
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
              {t('closer.title')}
            </h1>
            <p className="mt-1 font-inter text-sm text-white/80 md:text-base">
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