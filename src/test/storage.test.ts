import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSessionRound,
  getStoredSessionRounds,
  clearSessionHistory,
  computeSessionAnalytics,
  getAnonymousSessionId,
} from '../utils/storage';
import { GameSessionRecord } from '../types/game';
import { DIFFICULTY_CONFIGS, evaluateAdaptation } from '../utils/adaptation';

describe('Anonymous Session Telemetry Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates and persists an anonymous session ID', () => {
    const id1 = getAnonymousSessionId();
    const id2 = getAnonymousSessionId();
    expect(id1).toBe(id2);
    expect(id1.startsWith('anon_')).toBe(true);
  });

  it('saves and retrieves completed session rounds', () => {
    const adaptation = evaluateAdaptation(DIFFICULTY_CONFIGS.normal, 10, 18);
    const record: GameSessionRecord = {
      id: 'rec_test_1',
      roundNumber: 1,
      timestamp: new Date().toISOString(),
      seed: 'SEED-XYZ',
      difficultyId: 'normal',
      difficultyName: 'Standard (Level 2)',
      pairsTotal: 8,
      moves: 10,
      elapsedTimeSec: 18.0,
      accuracy: 80,
      adaptation,
    };

    saveSessionRound(record);
    const stored = getStoredSessionRounds();

    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('rec_test_1');
    expect(stored[0].moves).toBe(10);
    expect(stored[0].adaptation.action).toBe('promoted');
  });

  it('computes aggregated session KPIs accurately', () => {
    const adaptation = evaluateAdaptation(DIFFICULTY_CONFIGS.normal, 12, 20);
    const rec1: GameSessionRecord = {
      id: 'rec_1',
      roundNumber: 1,
      timestamp: new Date().toISOString(),
      seed: 'S1',
      difficultyId: 'normal',
      difficultyName: 'Standard (Level 2)',
      pairsTotal: 8,
      moves: 10,
      elapsedTimeSec: 20,
      accuracy: 80,
      adaptation,
    };
    const rec2: GameSessionRecord = {
      id: 'rec_2',
      roundNumber: 2,
      timestamp: new Date().toISOString(),
      seed: 'S2',
      difficultyId: 'hard',
      difficultyName: 'Challenging (Level 3)',
      pairsTotal: 10,
      moves: 20,
      elapsedTimeSec: 40,
      accuracy: 50,
      adaptation,
    };

    const analytics = computeSessionAnalytics([rec1, rec2]);
    expect(analytics.totalRounds).toBe(2);
    expect(analytics.averageMoves).toBe(15);
    expect(analytics.averageTimeSec).toBe(30);
    expect(analytics.averageAccuracy).toBe(65);
    expect(analytics.bestMoves).toBe(10);
  });

  it('clears session history completely', () => {
    const adaptation = evaluateAdaptation(DIFFICULTY_CONFIGS.normal, 12, 20);
    saveSessionRound({
      id: 'rec_to_clear',
      roundNumber: 1,
      timestamp: new Date().toISOString(),
      seed: 'S1',
      difficultyId: 'normal',
      difficultyName: 'Standard (Level 2)',
      pairsTotal: 8,
      moves: 12,
      elapsedTimeSec: 22,
      accuracy: 67,
      adaptation,
    });

    expect(getStoredSessionRounds().length).toBe(1);
    clearSessionHistory();
    expect(getStoredSessionRounds().length).toBe(0);
  });
});
