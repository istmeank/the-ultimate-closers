import { CheckCircle, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CallBookingFormData } from "@/lib/validations/callBookingSchema";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormStep7ConfirmationProps {
  bookingData: CallBookingFormData;
}

const FormStep7Confirmation = ({ bookingData }: FormStep7ConfirmationProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-fade-in text-center">
      <div className="inline-block p-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mb-4">
        <CheckCircle className="w-16 h-16 text-secondary" />
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
          {t('booking.step7.success')}
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('booking.step7.thanks')} <span className="text-secondary font-semibold">{bookingData.firstName}</span>, {t('booking.step7.message')}
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-8 max-w-xl mx-auto space-y-6">
        <h3 className="text-2xl font-semibold text-secondary mb-4">
          {t('booking.step7.details')}
        </h3>
        
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-4">
            <Calendar className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('booking.step7.date')}</p>
              <p className="text-muted-foreground">
                {bookingData.preferredDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('booking.step7.email')}</p>
              <p className="text-muted-foreground break-all">{bookingData.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('booking.step7.company')}</p>
              <p className="text-muted-foreground">{bookingData.companyName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/30 rounded-xl p-6 max-w-2xl mx-auto">
        <p className="text-lg font-medium mb-2">{t('booking.step7.next')}</p>
        <ul className="text-left space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-secondary mt-1">1.</span>
            <span>{t('booking.step7.next1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary mt-1">2.</span>
            <span>{t('booking.step7.next2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary mt-1">3.</span>
            <span>{t('booking.step7.next3')}</span>
          </li>
        </ul>
      </div>

      <div className="pt-6">
        <p className="text-2xl font-display italic text-secondary mb-6">
          "Votre stratégie mérite une exécution à sa hauteur.<br />
          On en parle bientôt."
        </p>
        
        <Button
          onClick={() => navigate('/')}
          size="lg"
          variant="outline"
          className="px-8"
        >
          {t('booking.step7.home')}
        </Button>
      </div>
    </div>
  );
};

export default FormStep7Confirmation;
