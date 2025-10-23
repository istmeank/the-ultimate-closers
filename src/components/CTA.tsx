import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section id="cta" className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl text-background mb-8">
            {t('cta.title')}
          </h2>

          <Button
            size="lg"
            onClick={() => window.location.href = '/reserver-appel'}
            className="bg-secondary hover:bg-secondary/90 text-primary font-bold px-10 py-7 rounded-full shadow-2xl hover:shadow-[0_0_40px_rgba(233,196,106,0.6)] hover:scale-105 transition-all group text-lg"
          >
            <Calendar className="mr-3 w-6 h-6" />
            {t('cta.button')}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
