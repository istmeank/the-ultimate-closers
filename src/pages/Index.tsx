import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import Services from '@/components/Services';
import AISection from '@/components/AISection';
import Results from '@/components/Results';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Track page view
    supabase.from('site_analytics').insert({
      event_type: 'page_view',
      page_path: window.location.pathname,
    });
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen font-inter">
        <Header />
        <main>
          <Hero />
          <Mission />
          <Services />
          <AISection />
          <Results />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
