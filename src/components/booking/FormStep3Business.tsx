import { UseFormReturn } from "react-hook-form";
import { CallBookingFormData } from "@/lib/validations/callBookingSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormStep3BusinessProps {
  form: UseFormReturn<CallBookingFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

const industries = [
  "SaaS / Tech", "E-commerce", "Services B2B", "Conseil", "Formation", 
  "Immobilier", "Finance", "Marketing", "Santé", "Autre"
];

const FormStep3Business = ({ form, onNext, onPrevious }: FormStep3BusinessProps) => {
  const { t } = useLanguage();
  
  const channels = [
    { id: "inbound", label: t('booking.channel.inbound') },
    { id: "outbound", label: t('booking.channel.outbound') },
    { id: "ads", label: t('booking.channel.ads') },
    { id: "referral", label: t('booking.channel.referral') },
    { id: "other", label: t('booking.channel.other') },
  ];
  const validateStep = async () => {
    const fields = ['industry', 'annualRevenue', 'salesTeamSize', 'currentChannels', 'mainChallenge'] as const;
    const isValid = await form.trigger(fields);
    if (isValid) onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mb-3">
          <Briefcase className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-2xl font-display font-bold">{t('booking.step3.title')}</h3>
        <p className="text-muted-foreground mt-2">{t('booking.step3.subtitle')}</p>
      </div>

      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step3.industry')} *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('booking.select')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="annualRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.step3.revenue')} *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('booking.select')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="<100K">&lt; 100K €</SelectItem>
                  <SelectItem value="100K-500K">100K - 500K €</SelectItem>
                  <SelectItem value="500K-1M">500K - 1M €</SelectItem>
                  <SelectItem value=">1M">&gt; 1M €</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salesTeamSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.step3.teamSize')} *</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="currentChannels"
        render={() => (
          <FormItem>
            <FormLabel>{t('booking.step3.channels')} *</FormLabel>
            <div className="space-y-2 mt-2">
              {channels.map((channel) => (
                <FormField
                  key={channel.id}
                  control={form.control}
                  name="currentChannels"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(channel.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const updated = checked
                              ? [...current, channel.id]
                              : current.filter((value) => value !== channel.id);
                            field.onChange(updated);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {channel.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="mainChallenge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step3.challenge')} *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Ex: Difficulté à générer des leads qualifiés de manière constante..."
                className="min-h-[120px]"
                {...field}
              />
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

export default FormStep3Business;
