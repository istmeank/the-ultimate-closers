import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90 p-4">
      {/* Language Selector - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="text-center space-y-6">
        <h1 className="text-9xl font-playfair font-bold text-secondary">{t('notfound.title')}</h1>
        <p className="text-2xl text-background/90">{t('notfound.subtitle')}</p>
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-secondary hover:bg-secondary/90 text-primary font-bold"
        >
          {t('notfound.home')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
