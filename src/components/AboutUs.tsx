import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Briefcase, Shield, Brain, TrendingUp, Layers } from 'lucide-react';
const AboutUs = () => {
  const {
    t
  } = useLanguage();
  const values = [{
    key: 'about.value1',
    icon: Heart,
    color: 'text-secondary'
  }, {
    key: 'about.value2',
    icon: Briefcase,
    color: 'text-primary'
  }, {
    key: 'about.value3',
    icon: Shield,
    color: 'text-secondary'
  }, {
    key: 'about.value4',
    icon: Brain,
    color: 'text-secondary'
  }, {
    key: 'about.value5',
    icon: TrendingUp,
    color: 'text-primary'
  }, {
    key: 'about.value6',
    icon: Layers,
    color: 'text-primary'
  }];
  return <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Texture marbre subtile */}
      
      
      <div className="container mx-auto px-4 relative z-10">
        {/* En-tête */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-secondary">
            {t('about.title')}
          </h2>
          <p className="font-inter text-lg md:text-xl text-foreground/80 leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Fondateurs - Dual Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Abdenacer */}
          <div className="group relative overflow-hidden p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-hairline hover:border-secondary transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in-scale">
            {/* Gradient background */}
            
            {/* Glow effect */}

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              {/* Photo placeholder - à remplacer */}
              <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-4xl font-bold text-secondary-foreground shadow-soft group-hover:scale-110 transition-transform">
                AM
              </div>
              <h3 className="font-display font-bold text-2xl text-secondary">
                {t('about.abdenacer.name')}
              </h3>
              <p className="font-inter text-sm font-semibold uppercase tracking-wider text-primary">
                {t('about.abdenacer.role')}
              </p>
              <p className="font-inter text-base text-foreground/80 leading-relaxed">
                {t('about.abdenacer.description')}
              </p>
            </div>
          </div>

          {/* Naim */}
          <div className="group relative overflow-hidden p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-hairline hover:border-secondary transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in-scale" style={{
          animationDelay: '0.1s'
        }}>
            {/* Gradient background */}
            
            {/* Glow effect */}

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-soft group-hover:scale-110 transition-transform">
                NS
              </div>
              <h3 className="font-display font-bold text-2xl text-secondary">
                {t('about.naim.name')}
              </h3>
              <p className="font-inter text-sm font-semibold text-primary uppercase tracking-wider">
                {t('about.naim.role')}
              </p>
              <p className="font-inter text-base text-foreground/80 leading-relaxed">
                {t('about.naim.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Manifesto */}
        <div className="max-w-3xl mx-auto mb-16 text-center animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <blockquote className="font-display text-2xl md:text-3xl font-semibold text-secondary italic border-l-4 border-secondary pl-6 py-4 bg-card/50 backdrop-blur-sm rounded-r-2xl shadow-lg">
            {t('about.manifesto')}
          </blockquote>
        </div>

        {/* Valeurs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {values.map(({
          key,
          icon: Icon,
          color
        }, index) => <div key={key} className="group relative overflow-hidden p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-hairline hover:border-secondary transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in-scale" style={{
          animationDelay: `${0.3 + index * 0.05}s`
        }}>
              {/* Gradient background */}
              
              {/* Glow effect */}
              
              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full bg-surface-3 border border-hairline group-hover:border-secondary transition-colors ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-inter font-semibold text-xs md:text-sm text-foreground">
                  {t(key)}
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default AboutUs;