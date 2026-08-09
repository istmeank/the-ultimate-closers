import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-handshake.jpg';

/**
 * Hero de la page publique.
 *
 * La photographie de la poignée de main est conservée telle quelle — c'est le
 * symbole du logo (charte §5 : « l'accord humain au cœur du système »). Le voile
 * malachite → noir la laisse lisible tout en garantissant le contraste du texte.
 *
 * Ce qui a été retiré : les vingt particules animées (charte §8 — « pas
 * d'éléments digitaux flashy », et elles se repositionnaient à chaque rendu) et
 * `background-attachment: fixed`, qui ne tient pas sur iOS et saccade au
 * défilement. La photo est désormais posée dans une couche dédiée, ce qui permet
 * de la précharger et d'éviter le rendu progressif en fond CSS.
 */
const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Photographie */}
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Voile de lecture — malachite profond vers noir, jeton --gradient-veil. */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--gradient-veil)' }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          {/* Signature de marque */}
          <p className="mb-6 inline-flex items-center rounded-full border border-gold/40 bg-black/30 px-4 py-1.5 font-inter text-xs font-medium tracking-[0.14em] text-gold uppercase backdrop-blur-sm">
            Closing is Art — Not Tbla3it
          </p>

          {/* Titre */}
          <h1 className="mb-6 font-display text-3xl font-bold leading-[1.15] text-white md:text-5xl lg:text-[3.25rem]">
            {t('hero.title')}
          </h1>

          {/* Sous-titre */}
          <p className="mx-auto mb-10 max-w-2xl font-inter text-lg leading-relaxed text-white/85 md:text-xl">
            {t('hero.subtitle')}
          </p>

          {/* Appels à l'action */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group rounded-full bg-gold px-8 py-6 font-semibold text-secondary shadow-soft transition-colors hover:bg-gold-strong"
            >
              <Link to="/reserver-appel">
                {t('hero.cta.primary')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white/45 bg-white/5 px-8 py-6 font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/auth">{t('hero.cta.secondary')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
