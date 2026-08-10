import { useLocation } from 'react-router-dom';

/**
 * ATMOSPHÈRE TUC — marbre malachite en thème clair, nuage violet en thème sombre.
 *
 * Deux registres, une seule marque :
 *
 * • CLAIR — le marbre du logo, veiné d'or, posé sous un voile crème. La matière
 *   est verte, la lumière est crème. On ne voit pas un motif : on devine une
 *   pierre. C'est l'inverse d'un ornement — le marbre n'a pas de dessin, il a
 *   une structure.
 *
 * • SOMBRE — le nuage violet sur socle malachite. C'est l'atmosphère de la
 *   section IA du site, étendue à l'application : le vert se dissout dans le
 *   violet, et l'ensemble reste une seule matière. Le violet n'est pas là pour
 *   décorer : en thème sombre, il EST le volet technologique de la marque
 *   devenu environnement.
 *
 * L'équilibre n'est jamais 100 / 0 : le vert reste la matière, le violet devient
 * le ciel. Environ 75/25 en clair, 55/45 en sombre.
 *
 * INTENSITÉ — pleine sur la vitrine et la connexion, fortement réduite derrière
 * le CRM. Un closer y passe huit heures : la lisibilité des données prime sur
 * l'ambiance. L'atmosphère respire dans les marges, jamais sous un tableau.
 *
 * Techniquement : une seule couche fixe, `aria-hidden`, sans interception de
 * pointeur, rendue dans un petit repère utilisateur puis étirée — le filtre de
 * turbulence travaille donc sur une surface minuscule et reste peu coûteux.
 * Neutralisée sous `prefers-reduced-motion` comme sous `print`.
 */

/** Routes où l'atmosphère se retire au second plan : les écrans de travail. */
const QUIET_PREFIXES = ['/admin', '/closer', '/dashboard', '/leads'];

export const AtmosphereBackground = () => {
  const { pathname } = useLocation();
  const quiet = QUIET_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div
      aria-hidden="true"
      data-atmosphere={quiet ? 'quiet' : 'full'}
      className="tuc-atmosphere"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Veinage de la pierre : bruit fractal, puis déplacement. */}
          <filter id="tuc-marble" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.045" numOctaves="4" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="46" />
          </filter>

          {/* Nuage : bruit plus lent, déplacement plus ample, puis flou. */}
          <filter id="tuc-cloud" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0075" numOctaves="5" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="80" />
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {/* ---------- THÈME CLAIR : marbre malachite veiné d'or ---------- */}
        <g className="tuc-atmosphere__light" filter="url(#tuc-marble)">
          <path
            d="M-60 70 Q90 26 210 96 T470 58"
            stroke="hsl(var(--malachite))"
            strokeWidth="46"
            fill="none"
            opacity="0.20"
          />
          <path
            d="M-60 190 Q120 130 250 216 T470 176"
            stroke="hsl(var(--malachite-mid))"
            strokeWidth="34"
            fill="none"
            opacity="0.18"
          />
          <path
            d="M-60 262 Q140 214 280 274 T470 244"
            stroke="hsl(var(--malachite))"
            strokeWidth="26"
            fill="none"
            opacity="0.12"
          />
          {/* Veines d'or — le kintsugi de la pierre. Fines, jamais droites. */}
          <path
            d="M-60 108 Q130 74 240 132 T470 100"
            stroke="hsl(var(--gold-glow))"
            strokeWidth="2.2"
            fill="none"
            opacity="0.42"
          />
          <path
            d="M-60 228 Q110 196 250 246 T470 214"
            stroke="hsl(var(--gold-glow))"
            strokeWidth="1.6"
            fill="none"
            opacity="0.34"
          />
        </g>

        {/* ---------- THÈME SOMBRE : nuage violet sur socle malachite ---------- */}
        <g className="tuc-atmosphere__dark" filter="url(#tuc-cloud)">
          <ellipse cx="90" cy="180" rx="170" ry="110" fill="hsl(var(--malachite-mid))" opacity="0.55" />
          <ellipse cx="250" cy="70" rx="180" ry="105" fill="hsl(var(--ramp-tech-deep))" opacity="0.85" />
          <ellipse cx="150" cy="35" rx="140" ry="70" fill="hsl(var(--ramp-tech))" opacity="0.45" />
          <ellipse cx="360" cy="230" rx="150" ry="95" fill="hsl(var(--ramp-plum))" opacity="0.40" />
        </g>
      </svg>
    </div>
  );
};

export default AtmosphereBackground;
