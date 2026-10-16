import { GameSessionRecord } from '../types/game';

const STORAGE_KEY = 'cerevyn_session_history_v1';
const SESSION_UUID_KEY = 'cerevyn_anon_uuid';

/**
 * Retrieves or initializes an anonymous device/session UUID.
 */
export function getAnonymousSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_UUID_KEY);
    if (!id) {
      id = 'anon_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(SESSION_UUID_KEY, id);
    }
    return id;
  } catch {
    return 'anon_ephemeral';
  }
}

/**
 * Get all completed session round records.
 */
export function getStoredSessionRounds(): GameSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse session history:', err);
    return [];
  }
}

/**
 * Append a newly completed round record.
 */
export function saveSessionRound(record: GameSessionRecord): void {
  try {
    const current = getStoredSessionRounds();
    // Keep up to 100 most recent rounds
    const updated = [record, ...current].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save session round:', err);
  }
}

/**
 * Clear all anonymous session records.
 */
export function clearSessionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session history:', err);
  }
}

export interface SessionAnalytics {
  totalRounds: number;
  averageMoves: number;
  averageTimeSec: number;
  averageAccuracy: number;
  bestMoves: number;
  promotionsCount: number;
  demotionsCount: number;
  maintainsCount: number;
  currentStreak: number;
}

/**
 * Aggregate summary metrics across all historical session rounds.
 */
export function computeSessionAnalytics(rounds: GameSessionRecord[]): SessionAnalytics {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      averageMoves: 0,
      averageTimeSec: 0,
      averageAccuracy: 0,
      bestMoves: 0,
      promotionsCount: 0,
      demotionsCount: 0,
      maintainsCount: 0,
      currentStreak: 0,
    };
  }

  let totalMoves = 0;
  let totalTime = 0;
  let totalAccuracy = 0;
  let bestMoves = Infinity;
  let promotions = 0;
  let demotions = 0;
  let maintains = 0;

  rounds.forEach((r) => {
    totalMoves += r.moves;
    totalTime += r.elapsedTimeSec;
    totalAccuracy += r.accuracy;
    if (r.moves < bestMoves) bestMoves = r.moves;

    if (r.adaptation.action === 'promoted') promotions++;
    else if (r.adaptation.action === 'demoted') demotions++;
    else maintains++;
  });

  return {
    totalRounds: rounds.length,
    averageMoves: parseFloat((totalMoves / rounds.length).toFixed(1)),
    averageTimeSec: parseFloat((totalTime / rounds.length).toFixed(1)),
    averageAccuracy: Math.round(totalAccuracy / rounds.length),
    bestMoves: bestMoves === Infinity ? 0 : bestMoves,
    promotionsCount: promotions,
    demotionsCount: demotions,
    maintainsCount: maintains,
    currentStreak: rounds.filter((r) => r.adaptation.action === 'promoted').length,
  };
}
