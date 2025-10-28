// Test de diagnostic pour le routage SPA
// À ajouter temporairement dans src/App.tsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RoutingDiagnostic = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 ROUTING DIAGNOSTIC:');
    console.log('- Current path:', location.pathname);
    console.log('- Expected component:', getExpectedComponent(location.pathname));
    console.log('- Window location:', window.location.href);
    console.log('- Document title:', document.title);
    
    // Vérifier si on est sur la bonne page
    if (location.pathname === '/auth' && document.title.includes('The Ultimate Closers')) {
      console.log('✅ Auth page loaded correctly');
    } else if (location.pathname === '/auth') {
      console.log('❌ Auth page not loaded - redirecting to main page');
    }
  }, [location]);

  const getExpectedComponent = (path: string) => {
    switch (path) {
      case '/': return 'Index';
      case '/auth': return 'Auth';
      case '/admin': return 'Admin';
      case '/dashboard-closer': return 'DashboardCloser';
      case '/reserver-appel': return 'BookCall';
      case '/legal': return 'Legal';
      default: return 'NotFound';
    }
  };

  return null;
};

export default RoutingDiagnostic;
