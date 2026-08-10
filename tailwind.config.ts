import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        hairline: "hsl(var(--hairline))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "ink-strong": "hsl(var(--ink-strong))",
        "surface-1": "hsl(var(--surface-1))",
        "surface-2": "hsl(var(--surface-2))",
        "surface-3": "hsl(var(--surface-3))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        gold: {
          /* Remplissage. Ne porte jamais de texte sur le crème (1,50:1). */
          DEFAULT: "hsl(var(--gold))",
          strong: "hsl(var(--gold-strong))",
          soft: "hsl(var(--gold-soft))",
          glow: "hsl(var(--gold-glow))",
          /* Le seul or lisible en texte : sombre sur clair, vif sur sombre. */
          ink: "hsl(var(--gold-ink))",
        },
        malachite: {
          DEFAULT: "hsl(var(--malachite))",
          mid: "hsl(var(--malachite-mid))",
          soft: "hsl(var(--malachite-soft))",
        },
        bordeaux: {
          DEFAULT: "hsl(var(--bordeaux))",
          soft: "hsl(var(--bordeaux-soft))",
        },
        /*
         * Volet technologique — troisième accent structurel de TUC, au même
         * rang que le malachite et l'or. Il marque tout ce que la machine fait.
         */
        tech: {
          DEFAULT: "hsl(var(--tech))",
          strong: "hsl(var(--tech-strong))",
          soft: "hsl(var(--tech-soft))",
          line: "hsl(var(--tech-line))",
          foreground: "hsl(var(--tech-foreground))",
        },
        /* Rampe continue vert → violet → vin. Le vin est le violet réchauffé. */
        ramp: {
          malachite: "hsl(var(--ramp-malachite))",
          "malachite-mid": "hsl(var(--ramp-malachite-mid))",
          "tech-deep": "hsl(var(--ramp-tech-deep))",
          tech: "hsl(var(--ramp-tech))",
          plum: "hsl(var(--ramp-plum))",
          wine: "hsl(var(--ramp-wine))",
          bordeaux: "hsl(var(--ramp-bordeaux))",
        },
        ank: {
          DEFAULT: "hsl(var(--ank))",
          soft: "hsl(var(--ank-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          /* Violet IA lisible sur une surface sombre (#C79BFA). */
          ondark: "hsl(var(--accent-ondark))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        /*
         * Playfair Display sur les titres — marqueur d'identité TUC, imposé par
         * le référentiel d'interface, pas une préférence. Cambria reste la
         * police des documents (BP, deck), elle n'a pas cours ici.
         */
        display: ['Playfair Display', 'Georgia', 'serif'],
        /* Alias historique conservé pour ne pas casser d'anciennes classes. */
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        hairline: "var(--shadow-hairline)",
        soft: "var(--shadow-soft)",
        raised: "var(--shadow-raised)",
        glass: "var(--shadow-glass)",
      },
      /*
       * Les dégradés de la charte sont déclarés ici, sinon `bg-gradient-cosmic`
       * et ses voisines ne produisent aucune règle CSS : la classe est ignorée
       * en silence et la section apparaît transparente. C'était le cas de la
       * section d'appel à l'action, qui laissait voir le crème et deux halos.
       */
      backgroundImage: {
        "gradient-cosmic": "var(--gradient-cosmic)",
        "gradient-gold": "var(--gradient-gold)",
        "gradient-ai": "var(--gradient-ai)",
        "gradient-neural": "var(--gradient-neural)",
        "gradient-veil": "var(--gradient-veil)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-scale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "glow-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 8px hsl(44, 73%, 66% / 0.4))" },
          "50%": { filter: "drop-shadow(0 0 20px hsl(44, 73%, 66% / 0.8))" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "particle-float": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(10px, -10px)" },
          "50%": { transform: "translate(-10px, -5px)" },
          "75%": { transform: "translate(5px, 10px)" }
        },
        "counter-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-scale": "fade-in-scale 0.5s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "particle-float": "particle-float 8s ease-in-out infinite",
        "counter-up": "counter-up 0.8s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
