import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoTUC from "@/assets/logo.png";

interface FormStep1IntroProps {
  onNext: () => void;
}

const FormStep1Intro = ({ onNext }: FormStep1IntroProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <img src={logoTUC} alt="The Ultimate Closers" className="w-24 h-24 object-contain mx-auto mb-4" />
        
        <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
          Réservez votre appel stratégique
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Cet appel découverte est conçu pour <span className="text-secondary font-semibold">évaluer si nos systèmes 
          d'acquisition éthique et automatisée</span> peuvent s'intégrer à votre modèle.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 md:p-8 space-y-4">
        <h3 className="text-xl font-semibold text-secondary">
          ⚡ Ce qui vous attend
        </h3>
        
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-secondary mt-1">•</span>
            <span>Une <strong className="text-foreground">analyse personnalisée</strong> de votre processus commercial actuel</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-secondary mt-1">•</span>
            <span>Des stratégies concrètes pour <strong className="text-foreground">automatiser votre prospection</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-secondary mt-1">•</span>
            <span>L'évaluation de la <strong className="text-foreground">compatibilité</strong> entre nos systèmes et vos objectifs</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-xl p-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-destructive">Important :</strong> Cet appel n'est pas un conseil gratuit. 
          C'est une évaluation mutuelle réservée aux <strong>dirigeants et responsables commerciaux 
          décidés à scaler leurs ventes</strong>. Merci de répondre avec précision pour qu'on prépare 
          une analyse personnalisée.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-secondary to-primary hover:shadow-[0_0_40px_rgba(233,196,106,0.5)] transition-all px-12 py-6 text-lg font-bold group"
        >
          Commencer le formulaire
          <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </Button>
      </div>
    </div>
  );
};

export default FormStep1Intro;
