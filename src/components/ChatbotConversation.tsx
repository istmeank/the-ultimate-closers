import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { detectDarijaLanguage } from '@/lib/darijaDetection';
import { DziriBERTSuggestions } from '@/components/DziriBERTSuggestions';

interface ChatbotConversationProps {
  onClose: () => void;
}

export const ChatbotConversation = ({ onClose }: ChatbotConversationProps) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDziriBERT, setShowDziriBERT] = useState(false);
  const [darijaConfidence, setDarijaConfidence] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    annual_revenue: '',
    urgency: '',
    main_challenge: '',
    sales_team_size: '',
  });

  const questions = [
    {
      id: 'identity',
      question: 'Bonjour ! Commençons par vos coordonnées',
      fields: ['first_name', 'last_name', 'email', 'phone'],
    },
    {
      id: 'company',
      question: 'Parlez-nous de votre entreprise',
      fields: ['company_name', 'annual_revenue'],
    },
    {
      id: 'needs',
      question: 'Quel est votre principal défi ?',
      fields: ['main_challenge', 'urgency'],
    },
    {
      id: 'team',
      question: 'Quelle est la taille de votre équipe commerciale ?',
      fields: ['sales_team_size'],
    },
  ];

  const currentQuestion = questions[step];

  const handleNext = async () => {
    // Validation simple
    const requiredFields = currentQuestion.fields;
    const hasEmptyFields = requiredFields.some(field => !formData[field as keyof typeof formData]);
    
    if (hasEmptyFields) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Détection Darija à l'étape 3 (main_challenge) - step 2 car index 0
    if (step === 2 && formData.main_challenge) {
      const darijaResult = await detectDarijaLanguage(formData.main_challenge);
      setDarijaConfidence(darijaResult.confidence);
      
      // Afficher DziriBERT si confiance > 70%
      if (darijaResult.isDarija && darijaResult.confidence > 0.7) {
        setShowDziriBERT(true);
        console.log('🇩🇿 Darija détecté:', darijaResult);
      }
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Détection finale Darija si pas encore faite
      let finalDarijaConfidence = darijaConfidence;
      let isDarijaSpeaker = darijaConfidence > 0.7;

      if (formData.main_challenge && !isDarijaSpeaker) {
        const darijaResult = await detectDarijaLanguage(formData.main_challenge);
        finalDarijaConfidence = darijaResult.confidence;
        isDarijaSpeaker = darijaResult.isDarija && darijaResult.confidence > 0.7;
      }

      // Appeler l'Edge Function score-lead
      const { data, error } = await supabase.functions.invoke('score-lead', {
        body: {
          leadData: {
            ...formData,
            source: 'chatbot',
            is_business_email: !formData.email.match(/@(gmail|hotmail|yahoo|outlook|live)\./),
            commitment_confirmed: true,
            sales_team_size: parseInt(formData.sales_team_size) || 0,
            is_darija_speaker: isDarijaSpeaker,
            darija_confidence: finalDarijaConfidence
          }
        }
      });

      if (error) throw error;

      const scoreMessage = isDarijaSpeaker 
        ? `Merci ! 🇩🇿 Darija détecté. Score: ${data.score}/100`
        : `Merci ! Votre demande a été enregistrée (Score: ${data.score}/100)`;

      toast.success(
        scoreMessage,
        {
          description: data.auto_assigned 
            ? 'Un closer vous contactera sous 24h' 
            : 'Nous reviendrons vers vous rapidement'
        }
      );

      setStep(step + 1); // Afficher l'écran de confirmation
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (step === questions.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h3 className="font-semibold text-xl">Merci !</h3>
          <p className="text-muted-foreground">
            Votre demande a été enregistrée avec succès.
            Un de nos closers vous contactera sous 24h.
          </p>
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Progression */}
      <div className="px-4 pt-4">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Étape {step + 1} sur {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4">{currentQuestion.question}</h3>

        {currentQuestion.fields.map((field) => (
          <div key={field}>
            {field === 'first_name' && (
              <>
                <Label>Prénom *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
              </>
            )}
            {field === 'last_name' && (
              <>
                <Label>Nom *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </>
            )}
            {field === 'email' && (
              <>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </>
            )}
            {field === 'phone' && (
              <>
                <Label>Téléphone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </>
            )}
            {field === 'company_name' && (
              <>
                <Label>Nom de l'entreprise *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="ACME Corp"
                />
              </>
            )}
            {field === 'annual_revenue' && (
              <>
                <Label>Chiffre d'affaires annuel *</Label>
                <Select
                  value={formData.annual_revenue}
                  onValueChange={(value) => setFormData({ ...formData, annual_revenue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<100K">Moins de 100K€</SelectItem>
                    <SelectItem value="100K-500K">100K - 500K€</SelectItem>
                    <SelectItem value="500K-1M">500K - 1M€</SelectItem>
                    <SelectItem value=">1M">Plus de 1M€</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {field === 'main_challenge' && (
              <>
                <Label>Quel est votre principal défi ? *</Label>
                <Textarea
                  value={formData.main_challenge}
                  onChange={(e) => setFormData({ ...formData, main_challenge: e.target.value })}
                  placeholder="Décrivez votre besoin principal..."
                  rows={3}
                />
                
                {/* Affichage conditionnel DziriBERT si Darija détecté */}
                {showDziriBERT && (
                  <div className="mt-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🇩🇿</span>
                      <p className="text-sm text-muted-foreground">
                        Darija détecté ! Suggestions de complétion :
                      </p>
                    </div>
                    <DziriBERTSuggestions
                      placeholder={formData.main_challenge}
                      onSelect={(completed) => {
                        setFormData({ ...formData, main_challenge: completed });
                        setShowDziriBERT(false);
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {field === 'urgency' && (
              <>
                <Label>Urgence *</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">Urgent (&lt; 1 mois)</SelectItem>
                    <SelectItem value="this_month">Ce mois-ci</SelectItem>
                    <SelectItem value="not_priority">Pas urgent</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {field === 'sales_team_size' && (
              <>
                <Label>Taille de l'équipe commerciale *</Label>
                <Input
                  type="number"
                  value={formData.sales_team_size}
                  onChange={(e) => setFormData({ ...formData, sales_team_size: e.target.value })}
                  placeholder="5"
                  min="0"
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t">
        <Button onClick={handleNext} disabled={loading} className="w-full">
          {loading ? (
            'Envoi en cours...'
          ) : step === questions.length - 1 ? (
            'Envoyer'
          ) : (
            <>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
