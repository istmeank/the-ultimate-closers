import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AddContentDialog = ({ onContentAdded }: { onContentAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [contentFr, setContentFr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!sectionId.trim()) {
        toast({
          title: 'Erreur',
          description: 'L\'identifiant de section est requis',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('site_content')
        .insert({
          section_id: sectionId.trim(),
          content_fr: contentFr,
          content_en: contentEn,
          content_ar: contentAr,
          image_url: imageUrl || null,
        });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Section ajoutée avec succès',
      });

      // Réinitialiser le formulaire
      setSectionId('');
      setContentFr('');
      setContentEn('');
      setContentAr('');
      setImageUrl('');
      setOpen(false);
      onContentAdded();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 text-primary">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-primary">
            Ajouter une section de contenu
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="section-id">Identifiant de section *</Label>
            <Input
              id="section-id"
              type="text"
              placeholder="ex: hero_title, about_description"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Utilisez snake_case (minuscules avec underscores)
            </p>
          </div>

          <div>
            <Label htmlFor="content-fr">Contenu en français</Label>
            <Textarea
              id="content-fr"
              placeholder="Texte en français..."
              value={contentFr}
              onChange={(e) => setContentFr(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content-en">Contenu en anglais</Label>
            <Textarea
              id="content-en"
              placeholder="English text..."
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content-ar">Contenu en arabe</Label>
            <Textarea
              id="content-ar"
              placeholder="النص بالعربية..."
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="image-url">URL de l'image (optionnel)</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-secondary hover:bg-secondary/90 text-primary"
              disabled={loading}
            >
              {loading ? 'Ajout...' : 'Ajouter la section'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
