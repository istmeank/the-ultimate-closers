import { useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import { leadsService } from '@/lib/services/leads.service';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, Building2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  score: number;
  interest: string | null;
  created_at: string;
}

export default function CloserLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const data = await leadsService.listForCloser(user.id);
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      qualified: 'bg-green-500',
      in_progress: 'bg-yellow-500',
      won: 'bg-emerald-500',
      lost: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl text-primary mb-2">Mes Leads</h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} lead{filteredLeads.length > 1 ? 's' : ''} assigné{filteredLeads.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card
            key={lead.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-background/95 backdrop-blur-sm border-secondary/20"
            onClick={() => navigate(`/dashboard-closer/leads/${lead.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{lead.full_name}</h3>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Score: {lead.score}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {lead.source}
                  </div>
                </div>

                {lead.interest && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Intérêt:</span> {lead.interest}
                  </p>
                )}
              </div>

              <div className="text-right text-sm text-muted-foreground">
                {new Date(lead.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </Card>
        ))}

        {filteredLeads.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {search ? 'Aucun lead trouvé pour cette recherche' : 'Aucun lead assigné pour le moment'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
