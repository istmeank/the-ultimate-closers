import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
const CTA = () => {
  const {
    t
  } = useLanguage();
  return <section id="cta" className="relative py-24 overflow-hidden bg-gradient-cosmic">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        

      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-8 text-primary-foreground">
            {t('cta.title')}
          </h2>

          <Button size="lg" onClick={() => window.location.href = '/reserver-appel'} className="bg-gold hover:bg-gold-strong text-secondary font-bold px-10 py-7 rounded-full shadow-soft transition-colors group text-lg font-inter">
            <Calendar className="mr-3 w-6 h-6" />
            {t('cta.button')}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </section>;
};
export default CTA;