import { useLanguage } from '@/contexts/LanguageContext';
import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.webp';
const Footer = () => {
  const {
    t
  } = useLanguage();
  const socialLinks = [{
    icon: Linkedin,
    href: '#',
    label: 'LinkedIn'
  }, {
    icon: Instagram,
    href: '#',
    label: 'Instagram'
  }, {
    icon: Youtube,
    href: '#',
    label: 'YouTube'
  }];
  return <footer className="relative bg-gradient-to-b from-[hsl(var(--malachite))] via-[hsl(167_69%_8%)] to-[hsl(167_60%_4%)] text-white py-16 overflow-hidden">
      {/*
        Veine kintsugi en tête de pied de page — l'ornement de TUC.
        La constellation qui vivait ici appartenait au registre cosmique de
        LULG : étoiles, lignes, halos violets. Sur TUC c'est un emprunt, la
        marque est minérale et taillée (référentiel d'interface, §16.1).
      */}
      <div
        aria-hidden="true"
        className="tuc-kintsugi absolute inset-x-0 top-0 opacity-70"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <img src={logo} alt="The Ultimate Closers Logo" className="w-12 h-12 object-contain" />
            <span className="font-display font-bold text-2xl text-white">
              The Ultimate Closers
            </span>
          </div>

          {/* Quote */}
          <blockquote className="max-w-2xl">
            <p className="font-display text-xl md:text-2xl italic text-gold/90">
              "{t('footer.quote')}"
            </p>
          </blockquote>

          {/* Contact Email */}
          <a href="mailto:contact@theultimateclosers.com" className="flex items-center gap-2 text-white/80 hover:text-secondary transition-colors group">
            <Mail className="w-5 h-5" />
            <span className="font-inter text-lg">contact@theultimateclosers.com</span>
          </a>

          {/* Social Links & Theme Toggle */}
          <div className="flex items-center gap-6">
            {socialLinks.map(({
            icon: Icon,
            href,
            label
          }) => <a key={label} href={href} aria-label={label} className="p-3 rounded-full bg-white/10 hover:bg-primary hover:text-primary-foreground text-white transition-all hover:scale-110">
                <Icon className="w-5 h-5" />
              </a>)}
            <ThemeToggle />
          </div>

          {/* Legal */}
          <div className="pt-8 border-t border-white/20 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© {new Date().getFullYear()} The Ultimate Closers. All rights reserved.</p>
            <Link to="/legal" className="hover:text-secondary transition-colors">
              Mentions légales & politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;