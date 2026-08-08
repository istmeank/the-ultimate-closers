import { useLanguage } from '@/contexts/LanguageContext';
import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';
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
  return <footer className="relative bg-gradient-to-b from-[#0a0520] via-[#050211] to-black text-white py-16 overflow-hidden">
      {/* Constellation background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-gold rounded-full animate-pulse" />
        <div className="absolute top-[25%] left-[25%] w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-[15%] left-[35%] w-0.5 h-0.5 bg-gold rounded-full animate-pulse" style={{
        animationDelay: '0.5s'
      }} />
        <div className="absolute top-[40%] left-[20%] w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-[50%] left-[10%] w-0.5 h-0.5 bg-gold rounded-full animate-pulse" style={{
        animationDelay: '1s'
      }} />
        
        <div className="absolute top-[20%] right-[20%] w-1 h-1 bg-gold rounded-full animate-pulse" style={{
        animationDelay: '0.3s'
      }} />
        <div className="absolute top-[35%] right-[15%] w-0.5 h-0.5 bg-white rounded-full" />
        <div className="absolute top-[45%] right-[25%] w-1 h-1 bg-gold rounded-full animate-pulse" style={{
        animationDelay: '0.7s'
      }} />
        <div className="absolute top-[60%] right-[30%] w-0.5 h-0.5 bg-white rounded-full" />
        <div className="absolute top-[70%] right-[18%] w-1 h-1 bg-gold rounded-full animate-pulse" style={{
        animationDelay: '1.2s'
      }} />
        
        <div className="absolute bottom-[20%] left-[40%] w-1 h-1 bg-white rounded-full" />
        <div className="absolute bottom-[30%] left-[50%] w-0.5 h-0.5 bg-gold rounded-full animate-pulse" style={{
        animationDelay: '0.8s'
      }} />
        <div className="absolute bottom-[15%] right-[45%] w-1 h-1 bg-white rounded-full" />
        
        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="15%" y1="10%" x2="25%" y2="25%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="25%" y1="25%" x2="35%" y2="15%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="25%" y1="25%" x2="20%" y2="40%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="20%" y1="40%" x2="10%" y2="50%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          
          <line x1="80%" y1="20%" x2="85%" y2="35%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="85%" y1="35%" x2="75%" y2="45%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="75%" y1="45%" x2="70%" y2="60%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="70%" y1="60%" x2="82%" y2="70%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          
          <line x1="40%" y1="80%" x2="50%" y2="70%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
          <line x1="50%" y1="70%" x2="55%" y2="85%" stroke="rgba(233,196,106,0.2)" strokeWidth="1" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <img src={logo} alt="The Ultimate Closers Logo" className="w-12 h-12 object-contain" />
            <span className="font-playfair font-bold text-2xl text-white">
              The Ultimate Closers
            </span>
          </div>

          {/* Quote */}
          <blockquote className="max-w-2xl">
            <p className="font-playfair text-xl md:text-2xl italic text-[#e8d759]/[0.88]">
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
          }) => <a key={label} href={href} aria-label={label} className="p-3 rounded-full bg-white/10 hover:bg-secondary hover:text-primary text-white transition-all hover:scale-110">
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