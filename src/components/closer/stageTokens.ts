import type { DealStage } from '@/lib/services/meet.service';

/**
 * Habillage visuel des 7 stades du pipeline (ADR-040).
 *
 * Les teintes viennent de la charte TUC (ADR-012) — malachite pour la
 * progression, or pour le prestige de l'affaire payée, bordeaux pour la perte.
 * Aucune teinte Tailwind par défaut : `violet-200`, `blue-50` et consorts ne
 * font pas partie de la marque.
 *
 * RÈGLE D'ACCESSIBILITÉ (WCAG 1.4.1) : la couleur n'est jamais seule porteuse
 * du sens. Chaque pastille est doublée du libellé textuel du stade, et
 * `srLabel` décrit la nature du stade pour les lecteurs d'écran.
 */
export interface StageToken {
  /** Classe de fond de la pastille de stade. */
  dot: string;
  /** Filet coloré en haut de colonne — 2 px, jamais un aplat. */
  rail: string;
  /** Teinte du titre de colonne. */
  title: string;
  /** Fond très léger de la zone de dépôt au survol du glisser. */
  dropTint: string;
  /** Nature du stade, lue par les technologies d'assistance. */
  srLabel: string;
}

export const STAGE_TOKENS: Record<DealStage, StageToken> = {
  opportunite: {
    dot: 'bg-muted-foreground',
    rail: 'bg-muted-foreground/50',
    title: 'text-foreground',
    dropTint: 'bg-muted/60',
    srLabel: 'entrée du pipeline',
  },
  programme: {
    dot: 'bg-secondary',
    rail: 'bg-secondary',
    title: 'text-foreground',
    dropTint: 'bg-secondary/10',
    srLabel: 'rendez-vous programmé',
  },
  a_reprogrammer: {
    dot: 'bg-gold-ink',
    rail: 'bg-gold-ink',
    title: 'text-foreground',
    dropTint: 'bg-gold-ink/10',
    srLabel: 'à reprogrammer',
  },
  a_relancer: {
    dot: 'bg-malachite-mid',
    rail: 'bg-malachite-mid',
    title: 'text-foreground',
    dropTint: 'bg-malachite-mid/10',
    srLabel: 'à relancer',
  },
  close: {
    dot: 'bg-malachite',
    rail: 'bg-malachite',
    title: 'text-foreground',
    dropTint: 'bg-malachite/10',
    srLabel: 'accord obtenu',
  },
  paye: {
    dot: 'bg-gold-ink',
    rail: 'bg-gradient-to-r from-gold-ink to-gold',
    title: 'text-gold-ink',
    dropTint: 'bg-gold/10',
    srLabel: 'affaire payée',
  },
  perdu: {
    dot: 'bg-bordeaux',
    rail: 'bg-bordeaux',
    title: 'text-muted-foreground',
    dropTint: 'bg-bordeaux/10',
    srLabel: 'affaire perdue',
  },
};
