import { UseFormReturn } from "react-hook-form";
import { CallBookingFormData } from "@/lib/validations/callBookingSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormStep4IntentionProps {
  form: UseFormReturn<CallBookingFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

const FormStep4Intention = ({ form, onNext, onPrevious }: FormStep4IntentionProps) => {
  const { t } = useLanguage();
  
  const validateStep = async () => {
    const fields = ['callObjective', 'hasUsedAiCrm', 'urgency'] as const;
    const isValid = await form.trigger(fields);
    if (isValid) onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mb-3">
          <Target className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-2xl font-display font-bold">{t('booking.step4.title')}</h3>
        <p className="text-muted-foreground mt-2">{t('booking.step4.subtitle')}</p>
      </div>

      <FormField
        control={form.control}
        name="callObjective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step4.objective')} *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-3 mt-2"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="automate" id="automate" />
                  <label htmlFor="automate" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('booking.step4.automate')}</div>
                    <div className="text-sm text-muted-foreground">{t('booking.step4.automate.desc')}</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="train_closers" id="train_closers" />
                  <label htmlFor="train_closers" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('booking.step4.train')}</div>
                    <div className="text-sm text-muted-foreground">{t('booking.step4.train.desc')}</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="rethink_pipeline" id="rethink_pipeline" />
                  <label htmlFor="rethink_pipeline" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('booking.step4.rethink')}</div>
                    <div className="text-sm text-muted-foreground">{t('booking.step4.rethink.desc')}</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="other" id="other" />
                  <label htmlFor="other" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('booking.step4.other')}</div>
                    <div className="text-sm text-muted-foreground">{t('booking.step4.other.desc')}</div>
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hasUsedAiCrm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step4.aiCrm')} *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="ai-yes" />
                  <label htmlFor="ai-yes" className="cursor-pointer">{t('booking.step4.aiCrm.yes')}</label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="ai-no" />
                  <label htmlFor="ai-no" className="cursor-pointer">{t('booking.step4.aiCrm.no')}</label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="in_progress" id="ai-progress" />
                  <label htmlFor="ai-progress" className="cursor-pointer">{t('booking.step4.aiCrm.progress')}</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="urgency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step4.urgency')} *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="this_week" id="urgent" />
                  <label htmlFor="urgent" className="cursor-pointer flex items-center gap-2">
                    <span>{t('booking.step4.urgency.week')}</span>
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">{t('booking.urgent')}</span>
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="within_month" id="month" />
                  <label htmlFor="month" className="cursor-pointer">{t('booking.step4.urgency.month')}</label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="not_priority" id="not-urgent" />
                  <label htmlFor="not-urgent" className="cursor-pointer">{t('booking.step4.urgency.not')}</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.button.back')}
        </Button>
        <Button
          type="button"
          onClick={validateStep}
          className="flex-1 bg-gradient-to-r from-secondary to-primary"
        >
          {t('booking.button.continue')}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FormStep4Intention;
