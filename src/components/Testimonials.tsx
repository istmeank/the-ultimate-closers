import { useLanguage } from '@/contexts/LanguageContext';
import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
const Testimonials = () => {
  const {
    t
  } = useLanguage();
  const testimonials = [{
    cardKey: 'testimonials.card1',
    nameKey: 'testimonials.name1',
    flag: '🇩🇿',
    initials: 'S'
  }, {
    cardKey: 'testimonials.card2',
    nameKey: 'testimonials.name2',
    flag: '🇫🇷',
    initials: 'M'
  }, {
    cardKey: 'testimonials.card3',
    nameKey: 'testimonials.name3',
    flag: '🇩🇿',
    initials: 'Y'
  }];
  return <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-[#016946]">
            {t('testimonials.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => <Card key={testimonial.cardKey} className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-scale bg-background dark:bg-black/80" style={{
          animationDelay: `${index * 0.15}s`
        }}>
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gold-glow)/0.14),transparent_70%)]" />

              <CardContent className="p-8 relative z-10">
                <Quote className="w-10 h-10 text-secondary dark:text-gold mb-4 opacity-50 group-hover:scale-110 transition-transform" />
                
                <p className="font-inter text-base text-foreground/80 dark:text-white/90 mb-6 leading-relaxed">
                  "{t(testimonial.cardKey)}"
                </p>

                <div className="flex items-center gap-3">
                  <Avatar className="border-2 border-secondary dark:border-gold group-hover:scale-110 transition-transform">
                    <AvatarFallback className="bg-primary dark:bg-gold text-background dark:text-black font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-inter font-semibold text-sm text-foreground dark:text-white">
                      {t(testimonial.nameKey)}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-white/60">{testimonial.flag}</p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default Testimonials;