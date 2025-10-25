import { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

export const TurnstileWidget = ({ onVerify, onError }: TurnstileProps) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    // Check if script already exists
    let script = document.querySelector('script[src*="turnstile"]') as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const initWidget = () => {
      if (widgetRef.current && (window as any).turnstile && !widgetId.current) {
        widgetId.current = (window as any).turnstile.render(widgetRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: onVerify,
          'error-callback': onError,
          theme: 'light',
        });
      }
    };

    if ((window as any).turnstile) {
      initWidget();
    } else {
      script.addEventListener('load', initWidget);
    }

    return () => {
      if (widgetId.current && (window as any).turnstile) {
        (window as any).turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [onVerify, onError]);

  return (
    <div className="flex justify-center my-4">
      <div ref={widgetRef} />
    </div>
  );
};
