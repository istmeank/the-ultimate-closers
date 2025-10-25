import { useLanguage } from '@/contexts/LanguageContext';
import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#121212] text-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <img src={logo} alt="The Ultimate Closers Logo" className="w-12 h-12 object-contain" />
            <span className="font-playfair font-bold text-2xl text-background">
              The Ultimate Closers
            </span>
          </div>

          {/* Quote */}
          <blockquote className="max-w-2xl">
            <p className="font-playfair text-xl md:text-2xl text-secondary/90 italic">
              "{t('footer.quote')}"
            </p>
          </blockquote>

          {/* Contact Email */}
          <a 
            href="mailto:contact@theultimateclosers.com"
            className="flex items-center gap-2 text-background/80 hover:text-secondary transition-colors group"
          >
            <Mail className="w-5 h-5" />
            <span className="font-inter text-lg">contact@theultimateclosers.com</span>
          </a>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-3 rounded-full bg-background/10 hover:bg-secondary hover:text-primary text-background transition-all hover:scale-110"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Legal */}
          <div className="pt-8 border-t border-background/20 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {new Date().getFullYear()} The Ultimate Closers. All rights reserved.</p>
            <Link to="/legal" className="hover:text-secondary transition-colors">
              Mentions légales & politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
