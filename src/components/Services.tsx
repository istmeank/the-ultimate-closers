import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, LineChart, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const Services = () => {
  const {
    t
  } = useLanguage();
  const services = [{
    icon: TrendingUp,
    titleKey: 'services.card1.title',
    textKey: 'services.card1.text',
    gradient: 'from-primary/10 to-accent/10'
  }, {
    icon: Users,
    titleKey: 'services.card2.title',
    textKey: 'services.card2.text',
    gradient: 'from-primary/10 to-accent/10'
  }, {
    icon: LineChart,
    titleKey: 'services.card3.title',
    textKey: 'services.card3.text',
    gradient: 'from-primary/10 to-accent/10'
  }, {
    icon: Bot,
    titleKey: 'services.card4.title',
    textKey: 'services.card4.text',
    gradient: 'from-primary/10 to-accent/10'
  }];
  return <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl mb-6 text-[#016946]">
            {t('services.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
          const Icon = service.icon;
          return <Card key={service.titleKey} className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-scale" style={{
            animationDelay: `${index * 0.15}s`
          }}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

                <CardHeader className="relative z-10">
                  <div className="mb-4 p-3 bg-background rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-secondary" />
                  </div>
                  <CardTitle className="font-playfair text-xl text-secondary">
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