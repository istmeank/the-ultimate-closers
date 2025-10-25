import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload } from 'lucide-react';

export const ContentEditor = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section_id');

      if (error) throw error;
      setSections(data || []);
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

  const handleSave = async (section: any) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          ...section,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Contenu sauvegardé avec succès',
      });
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
          Modifier le contenu
        </h2>
        <Button
          onClick={loadContent}
          variant="outline"
          className="border-background/20 text-background hover:bg-background/10"
        >
          Actualiser
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6">
          <p className="text-muted-foreground font-inter">
            Aucun contenu à modifier pour le moment. Ajoutez des sections de contenu depuis la base de données.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6"
            >
              <h3 className="font-playfair font-bold text-xl text-primary mb-4">
                Section: {section.section_id}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`${section.id}-fr`} className="text-primary">
                    Français
                  </Label>
                  <Textarea
                    id={`${section.id}-fr`}
                    value={section.content_fr || ''}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, content_fr: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`${section.id}-en`} className="text-primary">
                    English
                  </Label>
                  <Textarea
                    id={`${section.id}-en`}
                    value={section.content_en || ''}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, content_en: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`${section.id}-ar`} className="text-primary">
                    العربية
                  </Label>
                  <Textarea
                    id={`${section.id}-ar`}
                    value={section.content_ar || ''}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, content_ar: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                    className="mt-1"
                    rows={3}
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor={`${section.id}-image`} className="text-primary">
                    URL de l'image
                  </Label>
                  <Input
                    id={`${section.id}-image`}
                    value={section.image_url || ''}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, image_url: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                    className="mt-1"
                    placeholder="https://..."
                  />
                </div>

                <Button
                  onClick={() => handleSave(section)}
                  className="bg-secondary hover:bg-secondary/90 text-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
