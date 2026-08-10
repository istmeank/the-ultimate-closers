import type { DealStage } from '@/lib/services/meet.service';

/**
 * Habillage visuel des 7 stades du pipeline (ADR-040).
 *
 * LES STADES PARCOURENT LA RAMPE DE LA MARQUE.
 * La rampe TUC va du vert au vin en passant par le violet — une seule matière
 * qui change de température, de l'institution vers l'héritage :
 *
 *   malachite-mid → malachite → tech-deep → tech → plum → wine → bordeaux
 *
 * Le pipeline s'y installe naturellement : une affaire qui avance se réchauffe.
 * Elle entre en vert institutionnel, traverse le violet — le territoire de la
 * machine, là où le scoring et les relances travaillent — et sort soit dans le
 * vin, soit dans l'or.
 *
 * **L'or est la seule sortie de rampe.** « Payé » ne se mélange à rien : c'est
 * la couleur de prestige de la marque, elle marque l'aboutissement et rien
 * d'autre.
 *
 * ACCESSIBILITÉ (WCAG 1.4.1) : la couleur n'est jamais seule porteuse du sens.
 * Chaque pastille est doublée du libellé textuel du stade, et `srLabel` décrit
 * sa nature pour les technologies d'assistance.
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
    dot: 'bg-ramp-malachite-mid',
    rail: 'bg-ramp-malachite-mid',
    title: 'text-foreground',
    dropTint: 'bg-ramp-malachite-mid/10',
    srLabel: 'entrée du pipeline',
  },
  programme: {
    dot: 'bg-ramp-malachite',
    rail: 'bg-ramp-malachite',
    title: 'text-foreground',
    dropTint: 'bg-ramp-malachite/10',
    srLabel: 'rendez-vous programmé',
  },
  a_relancer: {
    dot: 'bg-ramp-tech-deep',
    rail: 'bg-ramp-tech-deep',
    title: 'text-foreground',
    dropTint: 'bg-ramp-tech-deep/10',
    srLabel: 'à relancer',
  },
  a_reprogrammer: {
    dot: 'bg-ramp-tech',
    rail: 'bg-ramp-tech',
    title: 'text-foreground',
    dropTint: 'bg-ramp-tech/10',
    srLabel: 'à reprogrammer',
  },
  close: {
    dot: 'bg-ramp-plum',
    rail: 'bg-ramp-plum',
    title: 'text-foreground',
    dropTint: 'bg-ramp-plum/10',
    srLabel: 'accord obtenu',
  },
  paye: {
    // Sortie de rampe : l'or ne se mélange à rien.
    dot: 'bg-gold-ink',
    rail: 'bg-gradient-to-r from-gold-ink to-gold',
    title: 'text-gold-ink',
    dropTint: 'bg-gold/10',
    srLabel: 'affaire payée',
  },
  perdu: {
    dot: 'bg-ramp-bordeaux',
    rail: 'bg-ramp-bordeaux',
    title: 'text-muted-foreground',
    dropTint: 'bg-ramp-bordeaux/10',
    srLabel: 'affaire perdue',
  },
};
