import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DebugInfo = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 Debug Info:');
    console.log('- Current path:', location.pathname);
    console.log('- Current search:', location.search);
    console.log('- Current hash:', location.hash);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Window location:', window.location.href);
  }, [location]);

  return null;
};

export default DebugInfo;
