import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector = ({ className = '' }: LanguageSelectorProps) => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'dar', flag: '🇩🇿', label: 'DZ' },
  ];

  return (
    <div className={`flex items-center gap-2 bg-muted rounded-full p-1 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            language === lang.code
              ? 'bg-secondary text-primary shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
