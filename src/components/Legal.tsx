import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Cookie, Lock, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import LanguageSelector from '@/components/LanguageSelector';

const Legal = () => {
  const { t } = useLanguage();

  useEffect(() => {
    // Mise à jour du titre de la page
    document.title = 'Mentions Légales & Politique de Confidentialité | The Ultimate Closers';
    
    // Mise à jour de la meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Politique de confidentialité, mentions légales conformes Loi 18-07 (Algérie) pour The Ultimate Closers. Protection des données personnelles.');
    }
    
    // Mise à jour des keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Loi 18-07, confidentialité, IA, closing, sécurité données, mentions légales, politique cookies, protection données, Algérie');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Language Selector - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au site
              </Button>
            </Link>
          </div>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl text-primary mb-4">
            Mentions Légales & Politique de Confidentialité
          </h1>
          <p className="text-muted-foreground text-lg">
            Conformes Loi 18-07 (Algérie) - Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Navigation rapide */}
          <div className="bg-background rounded-lg border p-6 mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <FileText className="w-5 h-5" />
              Navigation rapide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#mentions-legales" className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <FileText className="w-4 h-4 text-primary" />
                <span>Mentions légales</span>
              </a>
              <a href="#confidentialite" className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <Shield className="w-4 h-4 text-primary" />
                <span>Politique de confidentialité</span>
              </a>
            </div>
          </div>

          {/* MENTIONS LÉGALES */}
          <div id="mentions-legales" className="bg-background rounded-lg border p-6 mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
              <FileText className="w-6 h-6 text-primary" />
              Mentions Légales
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Éditeur du site</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>The Ultimate Closers (TUC)</strong></p>
                  <p>Entrepreneur individuel : <strong>Abdenacer MAREDJ</strong></p>
                  <p>Adresse : Coopérative Kerdouna N°169, Birkhadem – Alger, Algérie</p>
                  <p>Email : <a href="mailto:contact@theultimateclosers.com" className="text-primary hover:underline">contact@theultimateclosers.com</a></p>
                  <p>Téléphone : <a href="tel:+213792581917" className="text-primary hover:underline">+213 792 58 19 17</a></p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Statut juridique</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Entreprise individuelle en cours de formalisation (statut : entrepreneur – services numériques & consulting).</p>
                  <p><strong>Activité principale :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Conseil en acquisition client</li>
                    <li>Closing commercial B2B</li>
                    <li>Coaching & accompagnement professionnel</li>
                    <li>Systèmes IA appliqués au marketing et à la relation client</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Responsable de la publication</h3>
                <p className="text-muted-foreground">Abdenacer MAREDJ</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Hébergement du site</h3>
                <p className="text-muted-foreground">
                  Les données peuvent être hébergées hors Algérie. Conformément à la Loi 18-07, articles 40-45, 
                  les données peuvent être transférées hors territoire national dans les conditions prévues par la loi.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Propriété intellectuelle</h3>
                <p className="text-muted-foreground mb-3">
                  L'ensemble des éléments du site (textes, images, logos, vidéos, contenus pédagogiques, scripts IA, branding TUC & LULG) 
                  sont protégés par :
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>La loi algérienne relative à la propriété littéraire et artistique (Ordonnance 03-05)</li>
                  <li>Les conventions internationales en vigueur</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Toute reproduction, modification ou exploitation sans autorisation écrite est strictement interdite.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Conditions d'utilisation</h3>
                <p className="text-muted-foreground mb-3">
                  En accédant au site, l'utilisateur accepte pleinement les présentes mentions légales et s'engage à utiliser le site :
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>dans le respect des lois algériennes,</li>
                  <li>sans porter atteinte à la sécurité ou l'intégrité du site,</li>
                  <li>sans détourner les services.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">Services fournis</h3>
                <p className="text-muted-foreground mb-3">The Ultimate Closers fournit :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>du conseil stratégique en acquisition client</li>
                  <li>du closing commercial</li>
                  <li>des formations digitales</li>
                  <li>du coaching individuel</li>
                  <li>des scripts IA & automatisations</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Les informations du site sont indicatives et peuvent être modifiées sans préavis.
                </p>
              </section>
            </div>
          </div>

          {/* POLITIQUE DE CONFIDENTIALITÉ */}
          <div id="confidentialite" className="bg-background rounded-lg border p-6 mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
              <Shield className="w-6 h-6 text-primary" />
              Politique de Confidentialité — Conformité Loi 18-07 (Algérie)
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">1. Objet de la politique</h3>
                <p className="text-muted-foreground">
                  Cette politique explique comment The Ultimate Closers collecte, utilise, stocke et sécurise les données personnelles 
                  conformément à la Loi 18-07 du 10 juin 2018 relative à la protection des données personnelles.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">2. Données collectées</h3>
                <p className="text-muted-foreground mb-3">
                  Nous collectons uniquement les données nécessaires à nos services :
                </p>
                
                <h4 className="font-semibold text-foreground mt-4 mb-2">🔹 Données que vous pouvez fournir volontairement</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Nom, prénom</li>
                  <li>Email</li>
                  <li>Numéro de téléphone / WhatsApp</li>
                  <li>Informations professionnelles</li>
                  <li>Données renseignées dans nos formulaires (prise de rendez-vous, candidature PERCEPTION, CRM, etc.)</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4 mb-2">🔹 Données collectées automatiquement</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Adresse IP</li>
                  <li>Pages visitées</li>
                  <li>Cookies & données analytiques (Google Analytics ou équivalent)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">3. Finalités de traitement</h3>
                <p className="text-muted-foreground mb-3">Les données servent uniquement à :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Gestion des demandes clients</li>
                  <li>Prise de contact et suivi commercial</li>
                  <li>Création et gestion des comptes clients</li>
                  <li>Paiements (si applicable)</li>
                  <li>Amélioration du site et des services</li>
                  <li>Envoi d'emails d'information ou de formation</li>
                  <li>Statistiques internes</li>
                </ul>
                <p className="text-muted-foreground mt-3 font-semibold">
                  Nous ne vendons, ne louons et ne cédons jamais les données à des tiers.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">4. Base légale du traitement</h3>
                <p className="text-muted-foreground mb-3">
                  Conformément à la Loi 18-07, le traitement repose sur :
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Le consentement de l'utilisateur</li>
                  <li>L'exécution d'un contrat ou d'une demande préalable</li>
                  <li>L'intérêt légitime (sécurité, prévention fraude)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">5. Durée de conservation</h3>
                <p className="text-muted-foreground mb-3">Les données sont conservées :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>12 mois pour les demandes simples</li>
                  <li>5 ans pour les données contractuelles</li>
                  <li>Durée légale applicable pour documents comptables</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  L'utilisateur peut demander suppression + anonymisation à tout moment.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">6. Hébergement & transfert des données</h3>
                <p className="text-muted-foreground mb-3">Les données peuvent être hébergées :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>en Algérie</li>
                  <li>ou à l'étranger, si l'hébergeur est situé dans un pays offrant un niveau de protection adéquat (Loi 18-07, art. 42).</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Dans le cas contraire, un accord explicite est requis.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">7. Droits des utilisateurs (Loi 18-07)</h3>
                <p className="text-muted-foreground mb-3">L'utilisateur dispose des droits suivants :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Droit d'accès</li>
                  <li>Droit de rectification</li>
                  <li>Droit d'opposition</li>
                  <li>Droit à la suppression</li>
                  <li>Droit de retrait du consentement</li>
                  <li>Droit à l'information sur l'usage des données</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Pour exercer ses droits :<br />
                  📩 <a href="mailto:contact@theultimateclosers.com" className="text-primary hover:underline">contact@theultimateclosers.com</a>
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">8. Cookies</h3>
                <p className="text-muted-foreground mb-3">Le site utilise des cookies pour :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>mesures d'audience</li>
                  <li>optimisation du site</li>
                  <li>sécurité</li>
                  <li>gestion des sessions</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  L'utilisateur peut refuser les cookies via les paramètres de son navigateur.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">9. Sécurité des données</h3>
                <p className="text-muted-foreground mb-3">Nous mettons en place :</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>chiffrement SSL</li>
                  <li>pare-feux</li>
                  <li>limitation d'accès interne</li>
                  <li>procédures de prévention des fuites</li>
                  <li>sauvegardes sécurisées</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">10. Sous-traitants</h3>
                <p className="text-muted-foreground">
                  Si nous utilisons des outils externes (e.g., Google, Supabase, Vercel, Resend), ils peuvent traiter certaines données 
                  selon leurs politiques internes.
                </p>
                <p className="text-muted-foreground mt-3">
                  Une liste des sous-traitants peut être fournie sur demande.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-primary">11. Modification de la politique</h3>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de modifier cette politique. Elle sera mise à jour avec la date de révision.
                </p>
              </section>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary/5 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-3">Des questions ?</h3>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant vos données personnelles ou nos mentions légales
            </p>
            <Button asChild>
              <a href="mailto:contact@theultimateclosers.com">
                Nous contacter
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;