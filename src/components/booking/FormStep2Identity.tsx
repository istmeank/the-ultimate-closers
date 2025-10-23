import { UseFormReturn } from "react-hook-form";
import { CallBookingFormData } from "@/lib/validations/callBookingSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormStep2IdentityProps {
  form: UseFormReturn<CallBookingFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

const FormStep2Identity = ({ form, onNext, onPrevious }: FormStep2IdentityProps) => {
  const { t } = useLanguage();
  
  const validateStep = async () => {
    const fields = ['firstName', 'lastName', 'jobTitle', 'companyName', 'companyWebsite', 'companyLinkedin', 'email', 'phone'] as const;
    const isValid = await form.trigger(fields);
    if (isValid) onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mb-3">
          <User className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-2xl font-display font-bold">{t('booking.step2.title')}</h3>
        <p className="text-muted-foreground mt-2">{t('booking.step2.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.step2.firstName')} *</FormLabel>
              <FormControl>
                <Input placeholder="Jean" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.step2.lastName')} *</FormLabel>
              <FormControl>
                <Input placeholder="Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="jobTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step2.jobTitle')} *</FormLabel>
            <FormControl>
              <Input placeholder="Directeur Commercial" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step2.companyName')} *</FormLabel>
            <FormControl>
              <Input placeholder="TechCorp SAS" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.step2.companyWebsite')}</FormLabel>
              <FormControl>
                <Input placeholder="https://www.exemple.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyLinkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.step2.companyLinkedin')}</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/company/exemple" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step2.email')} *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="j.dupont@entreprise.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('booking.step2.phone')} *</FormLabel>
            <FormControl>
              <Input placeholder="+33 6 12 34 56 78" {...field} />
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

export default FormStep2Identity;
