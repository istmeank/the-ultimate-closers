import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Handshake, Heart } from 'lucide-react';
const WhyWeExist = () => {
  const {
    t
  } = useLanguage();
  const pillars = [{
    icon: Users,
    titleKey: 'why.card1.title',
    textKey: 'why.card1.text',
    color: 'text-secondary'
  }, {
    icon: Handshake,
    titleKey: 'why.card2.title',
    textKey: 'why.card2.text',
    color: 'text-secondary'
  }, {
    icon: Heart,
    titleKey: 'why.card3.title',
    textKey: 'why.card3.text',
    color: 'text-secondary'
  }];
  return <section id="why-we-exist" className="relative py-24 bg-gradient-to-b from-background via-accent/5 to-background overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl mb-6 text-[#016946]">
            {t('why.title')}
          </h2>
          <p className="font-inter text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            {t('why.subtitle')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return <div key={index} className="group relative bg-card/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-8 hover:border-secondary transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 animate-fade-in" style={{
            animationDelay: `${index * 150}ms`
          }}>
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-8 h-8 ${pillar.color}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <h3 className="font-playfair font-semibold text-xl text-secondary">
                    {t(pillar.titleKey)}
                  </h3>
                  <p className="font-inter text-foreground/80 leading-relaxed">
                    {t(pillar.textKey)}
                  </p>
                </div>

                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>;
        })}
        </div>
      </div>
    </section>;
};
export default WhyWeExist;