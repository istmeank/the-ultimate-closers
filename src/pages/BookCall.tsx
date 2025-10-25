import CallBookingForm from "@/components/booking/CallBookingForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const BookCall = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pt-24 pb-12">
      {/* Language Selector - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('booking.back')}
            </Button>
          </Link>
        </div>
        
        <CallBookingForm />
      </div>
    </div>
  );
};

export default BookCall;
