import { UseFormReturn } from "react-hook-form";
import { CallBookingFormData } from "@/lib/validations/callBookingSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FormStep5PracticalProps {
  form: UseFormReturn<CallBookingFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

const timezones = [
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
];

const FormStep5Practical = ({ form, onNext, onPrevious }: FormStep5PracticalProps) => {
  const validateStep = async () => {
    const fields = ['preferredDate', 'timezone', 'preferredPlatform'] as const;
    const isValid = await form.trigger(fields);
    if (isValid) onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mb-3">
          <Clock className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-2xl font-display font-bold">Planification</h3>
        <p className="text-muted-foreground mt-2">Choisissez votre créneau préféré</p>
      </div>

      <FormField
        control={form.control}
        name="preferredDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date préférée *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionnez une date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="timezone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fuseau horaire *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre fuseau horaire" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferredPlatform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plateforme préférée *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Comment souhaitez-vous nous rejoindre ?" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="google_meet">Google Meet</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          📅 Après validation, vous recevrez un email de confirmation avec le lien de l'appel 
          et la possibilité d'ajouter l'événement à votre calendrier.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Retour
        </Button>
        <Button
          type="button"
          onClick={validateStep}
          className="flex-1 bg-gradient-to-r from-secondary to-primary"
        >
          Continuer
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FormStep5Practical;
