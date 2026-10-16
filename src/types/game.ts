export type CardState = 'hidden' | 'flipped' | 'matched' | 'mismatched';

export interface CardItem {
  id: string;              // Unique card identifier (e.g., 'pair_1_a')
  pairId: number;          // Shared ID between matching pair
  iconName: string;        // Icon identifier
  label: string;           // Descriptive title (e.g., 'Quantum Core')
  color: string;           // Gradient/color theme
  state: CardState;
}

export type DifficultyLevelId = 'easy' | 'normal' | 'hard' | 'expert';

export interface DifficultyConfig {
  id: DifficultyLevelId;
  name: string;
  levelNumber: number;
  rows: number;
  cols: number;
  pairs: number;
  mismatchDelayMs: number;
  promoMovesThreshold: number;   // Moves <= this to qualify for promotion
  promoTimeThresholdSec: number; // Time <= this to qualify for promotion
  demoMovesThreshold: number;    // Moves > this triggers demotion
  demoTimeThresholdSec: number;  // Time > this triggers demotion
  description: string;
}

export interface AdaptationResult {
  previousDifficulty: DifficultyConfig;
  nextDifficulty: DifficultyConfig;
  action: 'promoted' | 'demoted' | 'maintained';
  reason: string;
  movesMetric: {
    actual: number;
    threshold: number;
    satisfied: boolean;
  };
  timeMetric: {
    actual: number;
    threshold: number;
    satisfied: boolean;
  };
  compositeScore: number;
}

export interface GameSessionRecord {
  id: string;
  roundNumber: number;
  timestamp: string;
  seed: string;
  difficultyId: DifficultyLevelId;
  difficultyName: string;
  pairsTotal: number;
  moves: number;
  elapsedTimeSec: number;
  accuracy: number;
  adaptation: AdaptationResult;
}

export interface GameState {
  cards: CardItem[];
  flippedIndices: number[];
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  elapsedTimeSec: number;
  isGameActive: boolean;
  isLocked: boolean;
  isWon: boolean;
  seed: string;
  difficulty: DifficultyConfig;
  lastAdaptation: AdaptationResult | null;
}
