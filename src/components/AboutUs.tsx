import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Briefcase, Shield, Brain, TrendingUp, Layers } from 'lucide-react';

const AboutUs = () => {
  const { t } = useLanguage();

  const values = [
    { key: 'about.value1', icon: Heart, color: 'text-secondary' },
    { key: 'about.value2', icon: Briefcase, color: 'text-primary' },
    { key: 'about.value3', icon: Shield, color: 'text-accent' },
    { key: 'about.value4', icon: Brain, color: 'text-secondary' },
    { key: 'about.value5', icon: TrendingUp, color: 'text-primary' },
    { key: 'about.value6', icon: Layers, color: 'text-accent' },
  ];

  return (
    <section 
      id="about" 
      className="py-24 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden"
    >
      {/* Texture marbre subtile */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-primary/10 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* En-tête */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-primary mb-6">
            {t('about.title')}
          </h2>
          <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Fondateurs - Dual Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Abdenacer */}
          <div className="group relative p-8 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              {/* Photo placeholder - à remplacer */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                AM
              </div>
              <h3 className="font-playfair font-bold text-2xl text-primary">
                {t('about.abdenacer.name')}
              </h3>
              <p className="font-inter text-sm font-semibold text-secondary uppercase tracking-wider">
                {t('about.abdenacer.role')}
              </p>
              <p className="font-inter text-base text-muted-foreground leading-relaxed">
                {t('about.abdenacer.description')}
              </p>
            </div>
          </div>

          {/* Naim */}
          <div className="group relative p-8 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-accent/20 hover:border-accent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                NS
              </div>
              <h3 className="font-playfair font-bold text-2xl text-primary">
                {t('about.naim.name')}
              </h3>
              <p className="font-inter text-sm font-semibold text-accent uppercase tracking-wider">
                {t('about.naim.role')}
              </p>
              <p className="font-inter text-base text-muted-foreground leading-relaxed">
                {t('about.naim.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Manifesto */}
        <div className="max-w-3xl mx-auto mb-16 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <blockquote className="font-playfair text-2xl md:text-3xl font-semibold text-primary italic border-l-4 border-secondary pl-6 py-4 bg-card/50 backdrop-blur-sm rounded-r-2xl shadow-lg">
            {t('about.manifesto')}
          </blockquote>
        </div>

        {/* Valeurs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {values.map(({ key, icon: Icon, color }, index) => (
            <div
              key={key}
              className="group relative p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-secondary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.05}s` }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full bg-background border-2 border-border group-hover:border-secondary transition-all ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-inter font-semibold text-xs md:text-sm text-foreground">
                  {t(key)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
