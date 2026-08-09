import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Database, Brain } from 'lucide-react';
import aiNetworkImage from '@/assets/ai-network.jpg';

const AISection = () => {
  const { t } = useLanguage();

  const features = [
    { key: 'ai.feature1', icon: MessageSquare },
    { key: 'ai.feature2', icon: Database },
    { key: 'ai.feature3', icon: Brain },
  ];

  return (
    <section
      id="ai"
      className="relative py-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.92), rgba(13, 77, 68, 0.90)), url(${aiNetworkImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
              }}
    >
      {/* Flowing light effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-ondark/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6">
            {t('ai.title')}
          </h2>
          <p className="font-inter text-lg md:text-xl text-white/90 leading-relaxed">
            {t('ai.text')}
          </p>
        </div>

        {/* AI Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map(({ key, icon: Icon }, index) => (
            <div
              key={key}
              className="group relative p-8 rounded-2xl bg-background/5 backdrop-blur-md border border-accent-ondark/25 hover:border-accent-ondark/60 hover:bg-background/10 transition-all duration-300 animate-fade-in-scale"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Glow on hover */}
              
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-accent-ondark/15 border-2 border-accent-ondark/70 group-hover:border-gold group-hover:rotate-12 transition-all">
                  <Icon className="w-10 h-10 text-accent-ondark group-hover:text-accent-ondark transition-colors" />
                </div>
                <h3 className="font-inter font-bold text-lg text-white">
                  {t(key)}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AISection;
