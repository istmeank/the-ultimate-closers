import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, LineChart, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const Services = () => {
  const {
    t
  } = useLanguage();
  /*
   * Deux registres, lisibles au premier regard : ce que fait l'humain et ce que
   * fait la machine. Le violet marque le volet technologique — « Audit Funnel &
   * IA » et « Automatisation IA Darija » — le malachite marque le closing et le
   * coaching. C'est la promesse de la marque rendue visible dans la grille.
   */
  const services = [{
    icon: TrendingUp,
    titleKey: 'services.card1.title',
    textKey: 'services.card1.text',
    tech: false
  }, {
    icon: Users,
    titleKey: 'services.card2.title',
    textKey: 'services.card2.text',
    tech: false
  }, {
    icon: LineChart,
    titleKey: 'services.card3.title',
    textKey: 'services.card3.text',
    tech: true
  }, {
    icon: Bot,
    titleKey: 'services.card4.title',
    textKey: 'services.card4.text',
    tech: true
  }];
  return <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-secondary">
            {t('services.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
          const Icon = service.icon;
          return <Card
                key={service.titleKey}
                className={`group relative overflow-hidden transition-colors duration-300 animate-fade-in-scale ${
                  service.tech
                    ? 'tuc-tech-panel hover:border-tech'
                    : 'border border-hairline bg-surface-1 hover:border-secondary'
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Filet de registre — 2 px, doublé du libellé « Technologie ». */}
                <div
                  aria-hidden="true"
                  className={`h-0.5 w-full ${service.tech ? 'bg-tech' : 'bg-secondary'}`}
                />

                <CardHeader className="relative z-10">
                  <div className={`mb-4 w-fit rounded-xl p-3 ${service.tech ? 'bg-tech-soft' : 'bg-surface-3'}`}>
                    <Icon className={`h-8 w-8 ${service.tech ? 'text-tech' : 'text-secondary'}`} />
                  </div>
                  {service.tech && (
                    <span className="tuc-tech-label mb-2 w-fit">Technologie</span>
                  )}
                  <CardTitle className={`font-display text-xl ${service.tech ? 'text-tech-strong' : 'text-secondary'}`}>
                    {t(service.titleKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="font-inter text-foreground/80">
                    {t(service.textKey)}
                  </CardDescription>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default Services;