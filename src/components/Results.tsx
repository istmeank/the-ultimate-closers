import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Shield, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
const Results = () => {
  const {
    t
  } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, {
      threshold: 0.2
    });
    const section = document.getElementById('results');
    if (section) observer.observe(section);
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);
  const metrics = [{
    key: 'results.metric1',
    icon: TrendingUp,
    color: 'text-secondary'
  }, {
    key: 'results.metric2',
    icon: Shield,
    color: 'text-accent'
  }, {
    key: 'results.metric3',
    icon: Star,
    color: 'text-primary'
  }];
  return <section id="results" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-[#016946]">
            {t('results.title')}
          </h2>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {metrics.map(({
          key,
          icon: Icon,
          color
        }, index) => <div key={key} className={`group relative overflow-hidden p-8 rounded-2xl bg-card border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-scale ${isVisible ? '' : 'opacity-0'}`} style={{
          animationDelay: `${index * 0.2}s`
        }}>
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gold-glow)/0.14),transparent_70%)]" />

              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className={`p-4 rounded-full bg-background border-2 border-border group-hover:border-secondary group-hover:scale-110 transition-transform ${color}`}>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="font-display font-bold text-2xl text-secondary">
                  {t(key)}
                </h3>
              </div>
            </div>)}
        </div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto">
          <blockquote className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-secondary animate-fade-in">
            <div className="absolute top-6 left-6 text-6xl text-secondary/20 font-display">"</div>
            <p className="font-inter text-lg md:text-xl text-foreground italic mb-4 relative z-10">
              {t('results.quote')}
            </p>
            <footer className="font-inter text-sm text-muted-foreground relative z-10">
              — {t('results.author')}
            </footer>
          </blockquote>
        </div>
      </div>
    </section>;
};
export default Results;