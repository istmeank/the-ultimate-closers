import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Briefcase, Target } from 'lucide-react';

export default function CloserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    max_concurrent_leads: 10,
    specialties: [] as string[],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        bio: data.bio || '',
        max_concurrent_leads: data.max_concurrent_leads || 10,
        specialties: (data.specialties as string[]) || [],
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          max_concurrent_leads: profile.max_concurrent_leads,
          specialties: profile.specialties,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-playfair text-3xl text-primary mb-2">Mon Profil Closer</h1>
        <p className="text-muted-foreground">
          Gérez vos informations et préférences
        </p>
      </div>

      <Card className="p-6 bg-background/95 backdrop-blur-sm border-secondary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Informations personnelles</h2>
              <p className="text-sm text-muted-foreground">Vos coordonnées et détails</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Parlez de votre expérience et expertise..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-background/95 backdrop-blur-sm border-secondary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Préférences de travail</h2>
              <p className="text-sm text-muted-foreground">Configurez votre charge de travail</p>
            </div>
          </div>

          <div>
            <Label htmlFor="max_leads">Nombre maximum de leads simultanés</Label>
            <Input
              id="max_leads"
              type="number"
              min="1"
              max="50"
              value={profile.max_concurrent_leads}
              onChange={(e) => setProfile({ ...profile, max_concurrent_leads: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Les leads sont assignés automatiquement en fonction de cette limite
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadProfile}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}
