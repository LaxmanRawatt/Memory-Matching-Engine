import { CardItem } from '../types/game';
import { createPRNG, shuffleArray } from './prng';

export interface CardArchetype {
  pairId: number;
  iconName: string;
  label: string;
  color: string;
  bgGlow: string;
  borderColor: string;
}

export const CARD_ARCHETYPES: CardArchetype[] = [
  {
    pairId: 0,
    iconName: 'Zap',
    label: 'Voltage',
    color: 'text-amber-400',
    bgGlow: 'from-amber-500/20 to-yellow-500/10',
    borderColor: 'border-amber-500/40',
  },
  {
    pairId: 1,
    iconName: 'Atom',
    label: 'Quantum',
    color: 'text-cyan-400',
    bgGlow: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'border-cyan-500/40',
  },
  {
    pairId: 2,
    iconName: 'Flame',
    label: 'Plasma',
    color: 'text-rose-400',
    bgGlow: 'from-rose-500/20 to-red-500/10',
    borderColor: 'border-rose-500/40',
  },
  {
    pairId: 3,
    iconName: 'Shield',
    label: 'Aegis',
    color: 'text-emerald-400',
    bgGlow: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/40',
  },
  {
    pairId: 4,
    iconName: 'Cpu',
    label: 'Cortex',
    color: 'text-violet-400',
    bgGlow: 'from-violet-500/20 to-purple-500/10',
    borderColor: 'border-violet-500/40',
  },
  {
    pairId: 5,
    iconName: 'Compass',
    label: 'Vector',
    color: 'text-sky-400',
    bgGlow: 'from-sky-500/20 to-indigo-500/10',
    borderColor: 'border-sky-500/40',
  },
  {
    pairId: 6,
    iconName: 'Globe',
    label: 'Nexus',
    color: 'text-teal-400',
    bgGlow: 'from-teal-500/20 to-emerald-500/10',
    borderColor: 'border-teal-500/40',
  },
  {
    pairId: 7,
    iconName: 'Sparkles',
    label: 'Prism',
    color: 'text-fuchsia-400',
    bgGlow: 'from-fuchsia-500/20 to-pink-500/10',
    borderColor: 'border-fuchsia-500/40',
  },
  {
    pairId: 8,
    iconName: 'Target',
    label: 'Beacon',
    color: 'text-orange-400',
    bgGlow: 'from-orange-500/20 to-amber-500/10',
    borderColor: 'border-orange-500/40',
  },
  {
    pairId: 9,
    iconName: 'Radio',
    label: 'Pulsar',
    color: 'text-lime-400',
    bgGlow: 'from-lime-500/20 to-green-500/10',
    borderColor: 'border-lime-500/40',
  },
  {
    pairId: 10,
    iconName: 'Dna',
    label: 'Helix',
    color: 'text-indigo-400',
    bgGlow: 'from-indigo-500/20 to-blue-500/10',
    borderColor: 'border-indigo-500/40',
  },
  {
    pairId: 11,
    iconName: 'Boxes',
    label: 'Matrix',
    color: 'text-pink-400',
    bgGlow: 'from-pink-500/20 to-rose-500/10',
    borderColor: 'border-pink-500/40',
  },
];

/**
 * Generate a deterministic deck of cards for a given pair count and seed.
 */
export function generateDeck(pairCount: number, seed: string): CardItem[] {
  const selectedArchetypes = CARD_ARCHETYPES.slice(0, pairCount);
  const deck: CardItem[] = [];

  selectedArchetypes.forEach((archetype) => {
    deck.push({
      id: `pair_${archetype.pairId}_a`,
      pairId: archetype.pairId,
      iconName: archetype.iconName,
      label: archetype.label,
      color: archetype.color,
      state: 'hidden',
    });
    deck.push({
      id: `pair_${archetype.pairId}_b`,
      pairId: archetype.pairId,
      iconName: archetype.iconName,
      label: archetype.label,
      color: archetype.color,
      state: 'hidden',
    });
  });

  const prng = createPRNG(seed);
  return shuffleArray(deck, prng);
}
