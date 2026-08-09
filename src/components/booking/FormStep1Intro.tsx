import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoTUC from "@/assets/logo.webp";
import { useLanguage } from "@/contexts/LanguageContext";
interface FormStep1IntroProps {
  onNext: () => void;
}
const FormStep1Intro = ({
  onNext
}: FormStep1IntroProps) => {
  const {
    t
  } = useLanguage();
  return <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-3 mb-4">
          <img src={logoTUC} alt="The Ultimate Closers" className="w-20 h-20 object-contain" />
          <p className="font-display text-2xl font-semibold text-[#0e4e40]">
            The Ultimate Closers
          </p>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
          {t('booking.step1.title')}
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('booking.step1.subtitle')}
        </p>
      </div>

      <div className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-scale rounded-2xl p-6 md:p-8 space-y-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity rounded-2xl" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gold-glow)/0.14),transparent_70%)] rounded-2xl" />

        <div className="relative z-10">
          <h3 className="text-xl font-semibold text-secondary">
            ⚡ {t('booking.step1.what')}
          </h3>
          
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-secondary mt-1">•</span>
              <span>{t('booking.step1.item1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-secondary mt-1">•</span>
              <span>{t('booking.step1.item2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-secondary mt-1">•</span>
              <span>{t('booking.step1.item3')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-xl p-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-destructive">{t('booking.step1.important')}</strong> {t('booking.step1.notice')}
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onNext} size="lg" className="bg-gradient-to-r from-secondary to-primary transition-all px-12 py-6 text-lg font-bold group">
          {t('booking.step1.button')}
          <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </Button>
      </div>
    </div>;
};
export default FormStep1Intro;