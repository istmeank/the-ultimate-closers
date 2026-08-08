import { useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import { profilesService } from '@/lib/services/profiles.service';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Briefcase, Target } from 'lucide-react';
import profileImage from '@/assets/abdenacer-profile.png';

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
      const user = await authService.getCurrentUser();
      if (!user) return;

      const data = await profilesService.getById(user.id);
      if (!data) return;

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
      const user = await authService.getCurrentUser();
      if (!user) return;

      await profilesService.update(user.id, {
        full_name: profile.full_name,
        bio: profile.bio,
        max_concurrent_leads: profile.max_concurrent_leads,
        specialties: profile.specialties,
      });

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
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-primary dark:border-gold shadow-lg">
          <AvatarImage src={profileImage} alt="Abdenacer Maredj" />
          <AvatarFallback className="text-2xl">AM</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-playfair text-3xl text-primary dark:text-gold mb-2">Mon Profil Closer</h1>
          <p className="text-muted-foreground dark:text-white/70">
            Gérez vos informations et préférences
          </p>
        </div>
      </div>

      <Card className="group relative overflow-hidden p-6 bg-background/95 dark:bg-black/80 backdrop-blur-sm border-2 hover:border-secondary transition-all duration-300">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b dark:border-white/10">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-gold/20">
              <User className="w-6 h-6 text-primary dark:text-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-lg dark:text-gold">Informations personnelles</h2>
              <p className="text-sm text-muted-foreground dark:text-white/70">Vos coordonnées et détails</p>
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

      <Card className="group relative overflow-hidden p-6 bg-background/95 dark:bg-black/80 backdrop-blur-sm border-2 hover:border-secondary transition-all duration-300">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b dark:border-white/10">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-gold/20">
              <Target className="w-6 h-6 text-primary dark:text-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-lg dark:text-gold">Préférences de travail</h2>
              <p className="text-sm text-muted-foreground dark:text-white/70">Configurez votre charge de travail</p>
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
            <p className="text-xs text-muted-foreground dark:text-white/60 mt-1">
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
