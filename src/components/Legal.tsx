import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Cookie, Lock } from 'lucide-react';
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
      metaDescription.setAttribute('content', 'Politique de confidentialité, mentions légales et politique de sécurité conformes RGPD pour The Ultimate Closers. Protection des données, cookies et droits utilisateurs.');
    }
    
    // Mise à jour des keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'RGPD, confidentialité, IA, closing, éthique, sécurité données, mentions légales, politique cookies, protection données');
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
            Conformes RGPD - Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="#confidentialite" className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <Shield className="w-4 h-4 text-primary" />
                <span>Politique de confidentialité</span>
              </a>
              <a href="#mentions-legales" className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <FileText className="w-4 h-4 text-primary" />
                <span>Mentions légales</span>
              </a>
              <a href="#securite-cookies" className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <Cookie className="w-4 h-4 text-primary" />
                <span>Sécurité & Cookies</span>
              </a>
            </div>
          </div>

          {/* 1. Politique de confidentialité */}
          <div id="confidentialite" className="bg-background rounded-lg border p-6 mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
              <Shield className="w-6 h-6 text-primary" />
              Politique de Confidentialité
              <span className="bg-secondary text-primary px-2 py-1 rounded text-sm">Conforme RGPD</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Responsable du traitement</h3>
                <p className="text-muted-foreground">
                  <strong>The Ultimate Closers</strong>, représentée par <strong>Abdenacer Maredj</strong><br />
                  E-mail : <a href="mailto:contact@theultimateclosers.com" className="text-primary hover:underline">contact@theultimateclosers.com</a>
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Données collectées</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Formulaires de contact, audit ou inscription</li>
                  <li>Données de navigation (cookies, pages visitées, durée, etc.)</li>
                  <li>Historique d'échanges via e-mail ou WhatsApp Business</li>
                  <li>Données de performance et d'utilisation des outils IA</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Finalités du traitement</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Répondre aux demandes de contact et de support</li>
                  <li>Proposer un audit ou une offre personnalisée</li>
                  <li>Améliorer les services et la relation client via IA</li>
                  <li>Analyser les performances et optimiser l'expérience utilisateur</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Durée de conservation</h3>
                <p className="text-muted-foreground">
                  Les données sont conservées jusqu'à <strong>3 ans après le dernier contact</strong>, 
                  sauf obligation légale contraire. Les données anonymisées peuvent être conservées 
                  plus longtemps à des fins statistiques.
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Droits des utilisateurs</h3>
                <p className="text-muted-foreground mb-3">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Droit d'accès à vos données personnelles</li>
                  <li>Droit de rectification des données inexactes</li>
                  <li>Droit de suppression ("droit à l'oubli")</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Pour exercer ces droits, contactez-nous à : 
                  <a href="mailto:contact@theultimateclosers.com" className="text-primary hover:underline">contact@theultimateclosers.com</a>
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">IA et traitement automatisé</h3>
                <p className="text-muted-foreground">
                  Certaines données peuvent être analysées via des outils d'intelligence artificielle 
                  pour améliorer l'expérience client et personnaliser nos services. 
                  <strong>Aucun profilage discriminatoire n'est effectué</strong> et tous les traitements 
                  respectent les principes éthiques de notre entreprise.
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Transfert hors UE</h3>
                <p className="text-muted-foreground">
                  Les données sont hébergées sur des serveurs conformes RGPD situés dans l'Union Européenne. 
                  Aucun transfert non autorisé n'est réalisé vers des pays tiers sans garanties appropriées.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Mentions légales */}
          <div id="mentions-legales" className="bg-background rounded-lg border p-6 mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
              <FileText className="w-6 h-6 text-primary" />
              Mentions Légales
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Éditeur du site</h3>
                <p className="text-muted-foreground">
                  <strong>The Ultimate Closers</strong> – fondé par <strong>Abdenacer Maredj</strong><br />
                  E-mail : <a href="mailto:contact@theultimateclosers.com" className="text-primary hover:underline">contact@theultimateclosers.com</a><br />
                  Site web : <a href="https://theultimateclosers.com" className="text-primary hover:underline">theultimateclosers.com</a>
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Hébergeur</h3>
                <p className="text-muted-foreground">
                  Le site est hébergé sur <strong>GitHub Pages</strong> et <strong>Vercel</strong><br />
                  Serveurs conformes aux normes européennes de sécurité et de protection des données.
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Propriété intellectuelle</h3>
                <p className="text-muted-foreground">
                  Tous les contenus (textes, visuels, vidéos, logos, design, code source) sont la propriété 
                  exclusive de <strong>The Ultimate Closers</strong>. Toute reproduction, diffusion ou 
                  modification sans autorisation écrite préalable est interdite et peut faire l'objet 
                  de poursuites judiciaires.
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Responsabilité</h3>
                <p className="text-muted-foreground">
                  The Ultimate Closers ne peut être tenu responsable des dommages directs ou indirects 
                  liés à l'utilisation du site ou de ses outils IA. L'utilisateur reste seul responsable 
                  de l'usage qu'il fait des informations fournies et des conseils prodigués.
                </p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Loi applicable</h3>
                <p className="text-muted-foreground">
                  Le présent site est soumis au droit français. En cas de litige, les tribunaux français 
                  seront seuls compétents.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Politique de sécurité & cookies */}
          <div id="securite-cookies" className="bg-background rounded-lg border p-6 mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
              <Lock className="w-6 h-6 text-primary" />
              Politique de Sécurité & Cookies
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Sécurité des données</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Le site utilise le protocole <strong>HTTPS</strong> pour toutes les communications</li>
                  <li>Pare-feu sécurisés et monitoring 24/7</li>
                  <li>Les données personnelles sont cryptées lors de la transmission</li>
                  <li>L'accès interne aux données est restreint aux membres autorisés</li>
                  <li>Sauvegardes régulières et sécurisées des données</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Cookies utilisés</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-base mb-2">Cookies essentiels</h4>
                    <p className="text-muted-foreground text-sm">
                      Nécessaires au bon fonctionnement du site (préférences de langue, session utilisateur).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-2">Cookies analytiques</h4>
                    <p className="text-muted-foreground text-sm">
                      Google Analytics, utilisés uniquement à des fins de performance et d'amélioration 
                      de l'expérience utilisateur (données anonymisées).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-2">Cookies marketing</h4>
                    <p className="text-muted-foreground text-sm">
                      Utilisés pour améliorer la pertinence des annonces et des contenus 
                      (avec consentement explicite de l'utilisateur).
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Gestion du consentement</h3>
                <p className="text-muted-foreground">
                  Un bandeau de cookies s'affiche dès la première visite. L'utilisateur peut :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Accepter tous les cookies</li>
                  <li>Refuser les cookies non essentiels</li>
                  <li>Personnaliser ses préférences par catégorie</li>
                  <li>Modifier ses choix à tout moment</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Protection des comptes</h3>
                <p className="text-muted-foreground">
                  En cas d'ajout d'un espace membre, les mesures de sécurité incluront :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Double authentification possible</li>
                  <li>Mots de passe chiffrés et politiques de complexité</li>
                  <li>Journalisation des connexions et activités</li>
                  <li>Détection des tentatives d'intrusion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary/5 rounded-lg border p-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Questions sur nos politiques ?</h3>
              <p className="text-muted-foreground mb-4">
                Pour toute question concernant nos politiques de confidentialité, 
                nos mentions légales ou notre politique de sécurité, contactez-nous :
              </p>
              <Button asChild>
                <a href="mailto:contact@theultimateclosers.com">
                  contact@theultimateclosers.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;