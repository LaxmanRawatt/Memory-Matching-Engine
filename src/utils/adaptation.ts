import { DifficultyConfig, DifficultyLevelId, AdaptationResult } from '../types/game';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevelId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Casual (Level 1)',
    levelNumber: 1,
    rows: 4,
    cols: 4,
    pairs: 8,
    mismatchDelayMs: 1200,
    promoMovesThreshold: 14,
    promoTimeThresholdSec: 32,
    demoMovesThreshold: 999, // Cannot demote below easy
    demoTimeThresholdSec: 999,
    description: 'Relaxed 1.2s card reveal window; ideal for warming up or recovering focus.',
  },
  normal: {
    id: 'normal',
    name: 'Standard (Level 2)',
    levelNumber: 2,
    rows: 4,
    cols: 4,
    pairs: 8,
    mismatchDelayMs: 850,
    promoMovesThreshold: 12,
    promoTimeThresholdSec: 25,
    demoMovesThreshold: 18,
    demoTimeThresholdSec: 45,
    description: 'Baseline 4x4 grid with 8 pairs and 850ms mismatch reaction window.',
  },
  hard: {
    id: 'hard',
    name: 'Challenging (Level 3)',
    levelNumber: 3,
    rows: 4,
    cols: 5,
    pairs: 10,
    mismatchDelayMs: 650,
    promoMovesThreshold: 16,
    promoTimeThresholdSec: 30,
    demoMovesThreshold: 24,
    demoTimeThresholdSec: 55,
    description: 'Expanded 20-card grid with 650ms preview window for agile memory recall.',
  },
  expert: {
    id: 'expert',
    name: 'Master (Level 4)',
    levelNumber: 4,
    rows: 4,
    cols: 6,
    pairs: 12,
    mismatchDelayMs: 500,
    promoMovesThreshold: 999, // Cannot promote past expert
    promoTimeThresholdSec: 999,
    demoMovesThreshold: 28,
    demoTimeThresholdSec: 65,
    description: '24 cards with 500ms rapid-fire preview; supreme cognitive endurance.',
  },
};

export const DIFFICULTY_ORDER: DifficultyLevelId[] = ['easy', 'normal', 'hard', 'expert'];

/**
 * Calculates adaptive difficulty progression for the subsequent round.
 *
 * Formal Decision Rule:
 * 1. PROMOTION: Triggered if moves <= promoMovesThreshold AND elapsedTimeSec <= promoTimeThresholdSec.
 * 2. DEMOTION: Triggered if moves > demoMovesThreshold OR elapsedTimeSec > demoTimeThresholdSec.
 * 3. MAINTENANCE: Triggered if neither condition is met.
 */
export function evaluateAdaptation(
  currentDifficulty: DifficultyConfig,
  moves: number,
  elapsedTimeSec: number
): AdaptationResult {
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty.id);
  const movesPromoSatisfied = moves <= currentDifficulty.promoMovesThreshold;
  const timePromoSatisfied = elapsedTimeSec <= currentDifficulty.promoTimeThresholdSec;

  const movesDemoTriggered = moves > currentDifficulty.demoMovesThreshold;
  const timeDemoTriggered = elapsedTimeSec > currentDifficulty.demoTimeThresholdSec;

  // Composite efficiency score (0 to 100)
  const optimalMoves = currentDifficulty.pairs;
  const moveEfficiency = Math.min(1, optimalMoves / Math.max(moves, 1));
  const timeEfficiency = Math.min(1, (currentDifficulty.promoTimeThresholdSec * 1.2) / Math.max(elapsedTimeSec, 1));
  const compositeScore = Math.round((0.6 * moveEfficiency + 0.4 * timeEfficiency) * 100);

  // Promotion evaluation
  if (movesPromoSatisfied && timePromoSatisfied && currentIndex < DIFFICULTY_ORDER.length - 1) {
    const nextDiffId = DIFFICULTY_ORDER[currentIndex + 1];
    const nextDifficulty = DIFFICULTY_CONFIGS[nextDiffId];

    const movesMargin = currentDifficulty.promoMovesThreshold - moves;
    const timeMargin = (currentDifficulty.promoTimeThresholdSec - elapsedTimeSec).toFixed(1);

    const reason =
      `Outstanding performance! You completed ${currentDifficulty.pairs} pairs in ${moves} moves ` +
      `(target: ≤ ${currentDifficulty.promoMovesThreshold}, margin: +${movesMargin}) and ${elapsedTimeSec.toFixed(1)}s ` +
      `(target: ≤ ${currentDifficulty.promoTimeThresholdSec}s, margin: +${timeMargin}s). ` +
      `Both accuracy and speed thresholds were satisfied. Difficulty increased to ${nextDifficulty.name} ` +
      `(${nextDifficulty.pairs} pairs, ${nextDifficulty.mismatchDelayMs}ms mismatch reveal).`;

    return {
      previousDifficulty: currentDifficulty,
      nextDifficulty,
      action: 'promoted',
      reason,
      movesMetric: {
        actual: moves,
        threshold: currentDifficulty.promoMovesThreshold,
        satisfied: true,
      },
      timeMetric: {
        actual: elapsedTimeSec,
        threshold: currentDifficulty.promoTimeThresholdSec,
        satisfied: true,
      },
      compositeScore,
    };
  }

  // Demotion evaluation
  if ((movesDemoTriggered || timeDemoTriggered) && currentIndex > 0) {
    const nextDiffId = DIFFICULTY_ORDER[currentIndex - 1];
    const nextDifficulty = DIFFICULTY_CONFIGS[nextDiffId];

    const triggerReasons: string[] = [];
    if (movesDemoTriggered) {
      triggerReasons.push(`moves (${moves} > ceiling of ${currentDifficulty.demoMovesThreshold})`);
    }
    if (timeDemoTriggered) {
      triggerReasons.push(`completion time (${elapsedTimeSec.toFixed(1)}s > ceiling of ${currentDifficulty.demoTimeThresholdSec}s)`);
    }

    const reason =
      `Cognitive load adjustment: Game exceeded threshold for ${triggerReasons.join(' and ')}. ` +
      `Difficulty eased to ${nextDifficulty.name} (${nextDifficulty.pairs} pairs, ` +
      `${nextDifficulty.mismatchDelayMs}ms mismatch reveal) to allow pattern reinforcement.`;

    return {
      previousDifficulty: currentDifficulty,
      nextDifficulty,
      action: 'demoted',
      reason,
      movesMetric: {
        actual: moves,
        threshold: currentDifficulty.demoMovesThreshold,
        satisfied: false,
      },
      timeMetric: {
        actual: elapsedTimeSec,
        threshold: currentDifficulty.demoTimeThresholdSec,
        satisfied: false,
      },
      compositeScore,
    };
  }

  // Maintenance evaluation
  let hint = '';
  if (!movesPromoSatisfied && !timePromoSatisfied) {
    hint = `Need ${moves - currentDifficulty.promoMovesThreshold} fewer moves and ${(elapsedTimeSec - currentDifficulty.promoTimeThresholdSec).toFixed(1)}s faster to advance.`;
  } else if (!movesPromoSatisfied) {
    hint = `Speed target achieved, but accuracy requires ${moves - currentDifficulty.promoMovesThreshold} fewer moves to advance.`;
  } else {
    hint = `Move target met! Need ${(elapsedTimeSec - currentDifficulty.promoTimeThresholdSec).toFixed(1)}s faster pace to advance.`;
  }

  const reason =
    `Balanced performance at ${currentDifficulty.name}. You completed ${currentDifficulty.pairs} pairs in ` +
    `${moves} moves and ${elapsedTimeSec.toFixed(1)}s. ${hint}`;

  return {
    previousDifficulty: currentDifficulty,
    nextDifficulty: currentDifficulty,
    action: 'maintained',
    reason,
    movesMetric: {
      actual: moves,
      threshold: currentDifficulty.promoMovesThreshold,
      satisfied: movesPromoSatisfied,
    },
    timeMetric: {
      actual: elapsedTimeSec,
      threshold: currentDifficulty.promoTimeThresholdSec,
      satisfied: timePromoSatisfied,
    },
    compositeScore,
  };
}
