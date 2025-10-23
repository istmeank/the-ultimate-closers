import { UseFormReturn } from "react-hook-form";
import { CallBookingFormData } from "@/lib/validations/callBookingSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Shield, AlertTriangle } from "lucide-react";

interface FormStep6CommitmentProps {
  form: UseFormReturn<CallBookingFormData>;
  onPrevious: () => void;
  isSubmitting: boolean;
}

const FormStep6Commitment = ({ form, onPrevious, isSubmitting }: FormStep6CommitmentProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mb-3">
          <Shield className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-2xl font-display font-bold">Dernière étape</h3>
        <p className="text-muted-foreground mt-2">Confirmez votre engagement</p>
      </div>

      <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-destructive text-base">
              ⚠️ Cet appel est réservé aux professionnels sérieux
            </p>
            
            <p className="text-muted-foreground">
              Cet appel découverte est conçu pour les <strong className="text-foreground">dirigeants et responsables 
              commerciaux décidés à scaler leurs ventes</strong>. Nous investissons du temps dans la préparation 
              d'une analyse personnalisée pour chaque prospect.
            </p>

            <div className="bg-card/50 rounded-lg p-4 space-y-2">
              <p className="font-medium">❌ Cet appel N'EST PAS pour vous si :</p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Vous cherchez uniquement un conseil gratuit</li>
                <li>• Vous n'êtes pas décisionnaire dans votre entreprise</li>
                <li>• Vous n'avez pas de budget pour investir dans votre croissance</li>
                <li>• Vous n'êtes pas sûr de pouvoir être présent</li>
              </ul>
            </div>

            <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
              <p className="font-medium text-secondary">✅ Cet appel EST pour vous si :</p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Vous voulez automatiser votre acquisition de clients</li>
                <li>• Vous êtes prêt à investir pour scaler votre business</li>
                <li>• Vous cherchez une solution éprouvée, pas des théories</li>
                <li>• Vous êtes décideur et prêt à agir rapidement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="commitmentConfirmed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border-2 border-secondary/30 p-4 bg-secondary/5">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                <span className="font-semibold text-base">
                  Je confirme mon engagement *
                </span>
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                Je comprends que cet appel est une évaluation mutuelle et je m'engage à être présent 
                à l'heure prévue. Je suis décisionnaire et prêt à investir dans la croissance de mon entreprise.
              </p>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Retour
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-secondary to-primary hover:shadow-[0_0_40px_rgba(233,196,106,0.5)] transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse">Envoi en cours...</span>
            </>
          ) : (
            <>
              Confirmer ma réservation
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormStep6Commitment;
