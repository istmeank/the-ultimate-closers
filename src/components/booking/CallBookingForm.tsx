import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CallBookingFormData, callBookingSchema } from "@/lib/validations/callBookingSchema";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProgressIndicator from "./ProgressIndicator";
import FormStep1Intro from "./FormStep1Intro";
import FormStep2Identity from "./FormStep2Identity";
import FormStep3Business from "./FormStep3Business";
import FormStep4Intention from "./FormStep4Intention";
import FormStep5Practical from "./FormStep5Practical";
import FormStep6Commitment from "./FormStep6Commitment";
import FormStep7Confirmation from "./FormStep7Confirmation";

const TOTAL_STEPS = 7;

const CallBookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<CallBookingFormData | null>(null);

  const form = useForm<CallBookingFormData>({
    resolver: zodResolver(callBookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      companyName: "",
      companyWebsite: "",
      companyLinkedin: "",
      email: "",
      phone: "",
      industry: "",
      annualRevenue: undefined,
      salesTeamSize: 0,
      currentChannels: [],
      mainChallenge: "",
      callObjective: undefined,
      hasUsedAiCrm: undefined,
      urgency: undefined,
      preferredDate: undefined,
      timezone: "",
      preferredPlatform: undefined,
      commitmentConfirmed: false,
    },
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: CallBookingFormData) => {
    setIsSubmitting(true);

    try {
      // Track analytics
      await supabase.from('site_analytics').insert({
        event_type: 'booking_form_started',
        page_path: '/reserver-appel',
        metadata: {
          industry: data.industry,
          revenue: data.annualRevenue,
          urgency: data.urgency,
        }
      });

      // Check if email domain is business (additional validation)
      const emailDomain = data.email.split('@')[1];
      const freeEmailDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com'];
      const isBusinessEmail = !freeEmailDomains.includes(emailDomain);

      // Insert booking
      const { error } = await supabase.from('call_bookings').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        job_title: data.jobTitle,
        company_name: data.companyName,
        company_website: data.companyWebsite || null,
        company_linkedin: data.companyLinkedin || null,
        email: data.email,
        phone: data.phone,
        is_business_email: isBusinessEmail,
        industry: data.industry,
        annual_revenue: data.annualRevenue,
        sales_team_size: data.salesTeamSize,
        current_channels: data.currentChannels,
        main_challenge: data.mainChallenge,
        call_objective: data.callObjective,
        has_used_ai_crm: data.hasUsedAiCrm,
        urgency: data.urgency,
        preferred_date: data.preferredDate.toISOString(),
        timezone: data.timezone,
        preferred_platform: data.preferredPlatform,
        commitment_confirmed: data.commitmentConfirmed,
        language: 'fr',
      });

      if (error) {
        if (error.message.includes('déjà une réservation')) {
          toast.error("Vous avez déjà une réservation en cours", {
            description: "Veuillez patienter 7 jours avant de réserver à nouveau."
          });
        } else {
          throw error;
        }
        setIsSubmitting(false);
        return;
      }

      // Track successful completion
      await supabase.from('site_analytics').insert({
        event_type: 'booking_form_completed',
        page_path: '/reserver-appel',
        metadata: {
          industry: data.industry,
          revenue: data.annualRevenue,
          urgency: data.urgency,
        }
      });

      setBookingData(data);
      setCurrentStep(TOTAL_STEPS);
      toast.success("Réservation confirmée !", {
        description: "Vous allez recevoir un email de confirmation."
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error("Une erreur est survenue", {
        description: "Veuillez réessayer ou nous contacter directement."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {currentStep < TOTAL_STEPS && (
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS - 1} />
      )}

      <div className="bg-card/30 backdrop-blur-sm border border-secondary/20 rounded-3xl p-6 md:p-10 shadow-2xl">
        {currentStep === 7 && bookingData ? (
          <FormStep7Confirmation bookingData={bookingData} />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {currentStep === 1 && <FormStep1Intro onNext={handleNext} />}
              {currentStep === 2 && <FormStep2Identity form={form} onNext={handleNext} onPrevious={handlePrevious} />}
              {currentStep === 3 && <FormStep3Business form={form} onNext={handleNext} onPrevious={handlePrevious} />}
              {currentStep === 4 && <FormStep4Intention form={form} onNext={handleNext} onPrevious={handlePrevious} />}
              {currentStep === 5 && <FormStep5Practical form={form} onNext={handleNext} onPrevious={handlePrevious} />}
              {currentStep === 6 && <FormStep6Commitment form={form} onPrevious={handlePrevious} isSubmitting={isSubmitting} />}
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default CallBookingForm;
