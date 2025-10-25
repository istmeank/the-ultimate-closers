import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Formation {
  id?: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  thumbnail_url: string;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
}

export const FormationsManager = () => {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const { toast } = useToast();

  const emptyFormation: Formation = {
    title: '',
    description: '',
    file_url: '',
    file_type: 'video',
    thumbnail_url: '',
    duration_minutes: 0,
    order_index: 0,
    is_published: false,
  };

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setFormations(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formation: Formation) => {
    try {
      if (formation.id) {
        // Update
        const { error } = await supabase
          .from('formations')
          .update(formation)
          .eq('id', formation.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('formations')
          .insert(formation);
        if (error) throw error;
      }

      toast({
        title: 'Succès',
        description: 'Formation sauvegardée avec succès',
      });
      
      setOpen(false);
      setEditingFormation(null);
      loadFormations();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;

    try {
      const { error } = await supabase
        .from('formations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Formation supprimée',
      });
      loadFormations();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const togglePublish = async (formation: any) => {
    try {
      const { error } = await supabase
        .from('formations')
        .update({ is_published: !formation.is_published })
        .eq('id', formation.id);

      if (error) throw error;
      loadFormations();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-background font-inter">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair font-bold text-3xl text-background">
          Formations
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingFormation(emptyFormation);
                setOpen(true);
              }}
              className="bg-secondary hover:bg-secondary/90 text-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFormation?.id ? 'Modifier' : 'Ajouter'} une formation
              </DialogTitle>
            </DialogHeader>
            {editingFormation && (
              <FormationForm
                formation={editingFormation}
                onSave={handleSave}
                onChange={setEditingFormation}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {formations.length === 0 ? (
        <Card className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6">
          <p className="text-muted-foreground font-inter">
            Aucune formation pour le moment. Cliquez sur "Ajouter" pour créer votre première formation.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {formations.map((formation) => (
            <Card
              key={formation.id}
              className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {formation.thumbnail_url ? (
                    <img
                      src={formation.thumbnail_url}
                      alt={formation.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-playfair font-bold text-lg text-primary">
                      {formation.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formation.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Durée: {formation.duration_minutes} min
                      </span>
                      <span className="text-muted-foreground">
                        Type: {formation.file_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`publish-${formation.id}`} className="text-sm">
                      Publié
                    </Label>
                    <Switch
                      id={`publish-${formation.id}`}
                      checked={formation.is_published}
                      onCheckedChange={() => togglePublish(formation)}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setEditingFormation(formation);
                      setOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => handleDelete(formation.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const FormationForm = ({
  formation,
  onSave,
  onChange,
}: {
  formation: Formation;
  onSave: (formation: Formation) => void;
  onChange: (formation: Formation) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formation.title}
          onChange={(e) => onChange({ ...formation, title: e.target.value })}
          placeholder="Nom de la formation"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formation.description}
          onChange={(e) => onChange({ ...formation, description: e.target.value })}
          placeholder="Décrivez la formation..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="file_url">URL du fichier *</Label>
        <Input
          id="file_url"
          value={formation.file_url}
          onChange={(e) => onChange({ ...formation, file_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="file_type">Type de fichier</Label>
        <Input
          id="file_type"
          value={formation.file_type}
          onChange={(e) => onChange({ ...formation, file_type: e.target.value })}
          placeholder="video, pdf, document..."
        />
      </div>

      <div>
        <Label htmlFor="thumbnail_url">URL de la miniature</Label>
        <Input
          id="thumbnail_url"
          value={formation.thumbnail_url}
          onChange={(e) => onChange({ ...formation, thumbnail_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="duration">Durée (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={formation.duration_minutes}
          onChange={(e) =>
            onChange({ ...formation, duration_minutes: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      <div>
        <Label htmlFor="order">Ordre d'affichage</Label>
        <Input
          id="order"
          type="number"
          value={formation.order_index}
          onChange={(e) =>
            onChange({ ...formation, order_index: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="published"
          checked={formation.is_published}
          onCheckedChange={(checked) =>
            onChange({ ...formation, is_published: checked })
          }
        />
        <Label htmlFor="published">Publier immédiatement</Label>
      </div>

      <Button
        onClick={() => onSave(formation)}
        className="w-full bg-secondary hover:bg-secondary/90 text-primary"
      >
        <Save className="w-4 h-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );
};
