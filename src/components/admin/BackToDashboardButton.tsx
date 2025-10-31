import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export const BackToDashboardButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/admin')}
      variant="outline"
      className="border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary hover:shadow-[0_0_15px_hsl(44,73%,66%/0.4)] transition-all duration-300"
    >
      <Home className="w-4 h-4 mr-2" />
      Accueil Admin
    </Button>
  );
};
