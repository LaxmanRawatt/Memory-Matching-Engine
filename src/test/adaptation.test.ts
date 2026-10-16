import { describe, it, expect } from 'vitest';
import { evaluateAdaptation, DIFFICULTY_CONFIGS } from '../utils/adaptation';

describe('Adaptive Difficulty Progression Engine', () => {
  it('promotes difficulty when moves and completion time are within promotion thresholds', () => {
    // Normal level: promoMovesThreshold: 12, promoTimeThresholdSec: 25
    const currentDiff = DIFFICULTY_CONFIGS.normal;
    const moves = 10; // <= 12
    const timeSec = 19.5; // <= 25

    const result = evaluateAdaptation(currentDiff, moves, timeSec);

    expect(result.action).toBe('promoted');
    expect(result.nextDifficulty.id).toBe('hard');
    expect(result.movesMetric.satisfied).toBe(true);
    expect(result.timeMetric.satisfied).toBe(true);
    expect(result.reason).toContain('Outstanding performance');
    expect(result.reason).toContain('Difficulty increased to Challenging (Level 3)');
  });

  it('demotes difficulty when moves exceed the demotion ceiling', () => {
    // Normal level: demoMovesThreshold: 18, demoTimeThresholdSec: 45
    const currentDiff = DIFFICULTY_CONFIGS.normal;
    const moves = 22; // > 18
    const timeSec = 30.0; // <= 45

    const result = evaluateAdaptation(currentDiff, moves, timeSec);

    expect(result.action).toBe('demoted');
    expect(result.nextDifficulty.id).toBe('easy');
    expect(result.movesMetric.satisfied).toBe(false);
    expect(result.reason).toContain('Cognitive load adjustment');
    expect(result.reason).toContain('Difficulty eased to Casual (Level 1)');
  });

  it('demotes difficulty when completion time exceeds the demotion ceiling', () => {
    const currentDiff = DIFFICULTY_CONFIGS.normal;
    const moves = 14; // <= 18
    const timeSec = 52.0; // > 45

    const result = evaluateAdaptation(currentDiff, moves, timeSec);

    expect(result.action).toBe('demoted');
    expect(result.nextDifficulty.id).toBe('easy');
    expect(result.reason).toContain('completion time');
  });

  it('maintains difficulty when performance is intermediate', () => {
    // Normal: promo <= 12 moves & <= 25s; demo > 18 moves or > 45s
    const currentDiff = DIFFICULTY_CONFIGS.normal;
    const moves = 15; // > 12 but <= 18
    const timeSec = 22.0; // <= 25s

    const result = evaluateAdaptation(currentDiff, moves, timeSec);

    expect(result.action).toBe('maintained');
    expect(result.nextDifficulty.id).toBe('normal');
    expect(result.reason).toContain('Balanced performance');
  });

  it('cannot promote past the maximum level (Expert)', () => {
    const expertDiff = DIFFICULTY_CONFIGS.expert;
    const result = evaluateAdaptation(expertDiff, 12, 20.0);

    expect(result.action).toBe('maintained');
    expect(result.nextDifficulty.id).toBe('expert');
  });

  it('cannot demote below the minimum level (Easy)', () => {
    const easyDiff = DIFFICULTY_CONFIGS.easy;
    const result = evaluateAdaptation(easyDiff, 50, 120.0);

    expect(result.action).toBe('maintained');
    expect(result.nextDifficulty.id).toBe('easy');
  });

  it('calculates composite score between 0 and 100', () => {
    const result = evaluateAdaptation(DIFFICULTY_CONFIGS.normal, 12, 24);
    expect(result.compositeScore).toBeGreaterThanOrEqual(0);
    expect(result.compositeScore).toBeLessThanOrEqual(100);
  });
});
