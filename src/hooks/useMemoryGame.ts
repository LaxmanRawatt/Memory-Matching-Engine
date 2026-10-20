import { useState, useEffect, useRef, useCallback } from 'react';
import { CardItem, DifficultyConfig, AdaptationResult, GameSessionRecord } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../utils/adaptation';
import { generateDeck } from '../utils/cardDefinitions';
import { generateRandomSeed } from '../utils/prng';
import { evaluateAdaptation } from '../utils/adaptation';
import { saveSessionRound } from '../utils/storage';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface UseMemoryGameOptions {
  initialDifficultyId?: keyof typeof DIFFICULTY_CONFIGS;
  initialSeed?: string;
}

export function useMemoryGame(options: UseMemoryGameOptions = {}) {
  const [seed, setSeed] = useState<string>(options.initialSeed || generateRandomSeed());
  const [difficulty, setDifficulty] = useState<DifficultyConfig>(
    DIFFICULTY_CONFIGS[options.initialDifficultyId || 'normal']
  );
  const [cards, setCards] = useState<CardItem[]>(() => generateDeck(difficulty.pairs, seed));
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [lastAdaptation, setLastAdaptation] = useState<AdaptationResult | null>(null);
  const [roundNumber, setRoundNumber] = useState<number>(1);

  // Active timers tracking set for guaranteed cleanup on restart/unmount
  const activeTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAccumulatedRef = useRef<number>(0);

  // Safe setTimeout wrapper that tracks timers
  const safeSetTimeout = useCallback((fn: () => void, delayMs: number) => {
    const timer = setTimeout(() => {
      activeTimersRef.current.delete(timer);
      fn();
    }, delayMs);
    activeTimersRef.current.add(timer);
    return timer;
  }, []);

  // Clear all pending timeouts
  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current.clear();
  }, []);

  // Stop active elapsed time tracking
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Start or resume elapsed time tracking
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) return;
    const initialStart = performance.now();
    startTimeRef.current = initialStart;

    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const delta = (performance.now() - startTimeRef.current) / 1000;
        setElapsedTimeSec(parseFloat((pausedAccumulatedRef.current + delta).toFixed(1)));
      }
    }, 100);
  }, []);

  // Reset/Restart game with clean state and cancellation of all timers
  const restartGame = useCallback(
    (newSeed?: string, newDifficulty?: DifficultyConfig) => {
      // 1. Immediately cancel all pending timeouts to prevent old game callbacks from affecting new game
      clearAllTimers();
      stopTimer();

      const nextDifficulty = newDifficulty || difficulty;
      const nextSeed = newSeed !== undefined ? newSeed : generateRandomSeed();

      startTimeRef.current = null;
      pausedAccumulatedRef.current = 0;

      setSeed(nextSeed);
      setDifficulty(nextDifficulty);
      setCards(generateDeck(nextDifficulty.pairs, nextSeed));
      setFlippedIndices([]);
      setMoves(0);
      setMatchedPairs(0);
      setElapsedTimeSec(0);
      setIsGameActive(false);
      setIsLocked(false);
      setIsWon(false);
      setLastAdaptation(null);
    },
    [clearAllTimers, difficulty, stopTimer]
  );

  // Advance to next round with adaptive difficulty
  const advanceToNextRound = useCallback(() => {
    const nextDiff = lastAdaptation?.nextDifficulty || difficulty;
    setRoundNumber((r) => r + 1);
    restartGame(generateRandomSeed(), nextDiff);
  }, [difficulty, lastAdaptation, restartGame]);

  // Handle card click
  const handleCardClick = useCallback(
    (index: number) => {
      // Rule 1: Prevent interaction when locked (e.g. resolving mismatch)
      if (isLocked) {
        return;
      }

      // Rule 2: Prevent interaction if game is already won
      if (isWon) {
        return;
      }

      const card = cards[index];
      if (!card) return;

      // Rule 3: Handle clicks on already matched cards (ignore / no-op)
      if (card.state === 'matched') {
        return;
      }

      // Rule 4: Handle repeat clicks on the same revealed card (ignore / no-op)
      if (card.state === 'flipped' || flippedIndices.includes(index)) {
        return;
      }

      // Activate game & timer on first valid click
      if (!isGameActive) {
        setIsGameActive(true);
        startTimer();
      }

      // Play flip sound
      sound.playFlip();

      // First card flipped
      if (flippedIndices.length === 0) {
        setCards((prev) =>
          prev.map((c, i) => (i === index ? { ...c, state: 'flipped' } : c))
        );
        setFlippedIndices([index]);
        return;
      }

      // Second card flipped: Complete a move
      if (flippedIndices.length === 1) {
        const firstIndex = flippedIndices[0];
        const firstCard = cards[firstIndex];
        const isMatch = firstCard.pairId === card.pairId;
        const newMoves = moves + 1;
        setMoves(newMoves);

        if (isMatch) {
          // MATCH!
          sound.playMatch();
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);

          setCards((prev) =>
            prev.map((c, i) =>
              i === index || i === firstIndex ? { ...c, state: 'matched' } : c
            )
          );
          setFlippedIndices([]);

          // Check Win Condition
          if (newMatched === difficulty.pairs) {
            stopTimer();
            setIsWon(true);
            sound.playVictory();

            // Trigger celebration confetti
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // Ignore confetti errors if canvas is unavailable
            }

            // Calculate active elapsed time
            const finalTime = startTimeRef.current === null
              ? elapsedTimeSec
              : parseFloat((pausedAccumulatedRef.current + (performance.now() - startTimeRef.current) / 1000).toFixed(1));
            setElapsedTimeSec(finalTime);

            // Evaluate explainable adaptive difficulty
            const adaptation = evaluateAdaptation(difficulty, newMoves, finalTime);
            setLastAdaptation(adaptation);

            // Record anonymous session result
            const record: GameSessionRecord = {
              id: 'rec_' + Date.now().toString(36),
              roundNumber,
              timestamp: new Date().toISOString(),
              seed,
              difficultyId: difficulty.id,
              difficultyName: difficulty.name,
              pairsTotal: difficulty.pairs,
              moves: newMoves,
              elapsedTimeSec: finalTime,
              accuracy: Math.round((difficulty.pairs / newMoves) * 100),
              adaptation,
            };
            saveSessionRound(record);
          }
        } else {
          // MISMATCH!
          sound.playMismatch();

          // Mark both cards as mismatched
          setCards((prev) =>
            prev.map((c, i) =>
              i === index || i === firstIndex ? { ...c, state: 'mismatched' } : c
            )
          );

          // LOCK board to strictly prevent a 3rd selection
          setIsLocked(true);

          // Revert cards to hidden after documented delay
          safeSetTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === index || i === firstIndex ? { ...c, state: 'hidden' } : c
              )
            );
            setFlippedIndices([]);
            setIsLocked(false);
          }, difficulty.mismatchDelayMs);
        }
      }
    },
    [
      cards,
      difficulty,
      elapsedTimeSec,
      flippedIndices,
      isGameActive,
      isLocked,
      isWon,
      matchedPairs,
      moves,
      roundNumber,
      safeSetTimeout,
      seed,
      startTimer,
      stopTimer,
    ]
  );

  // Manual difficulty change
  const setDifficultyDirectly = useCallback(
    (diffId: keyof typeof DIFFICULTY_CONFIGS) => {
      const newDiff = DIFFICULTY_CONFIGS[diffId];
      restartGame(seed, newDiff);
    },
    [restartGame, seed]
  );

  // Manual seed change
  const setSeedDirectly = useCallback(
    (newSeed: string) => {
      restartGame(newSeed, difficulty);
    },
    [difficulty, restartGame]
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      stopTimer();
    };
  }, [clearAllTimers, stopTimer]);

  return {
    cards,
    seed,
    difficulty,
    moves,
    matchedPairs,
    totalPairs: difficulty.pairs,
    elapsedTimeSec,
    isGameActive,
    isLocked,
    isWon,
    lastAdaptation,
    roundNumber,
    handleCardClick,
    restartGame,
    advanceToNextRound,
    setDifficultyDirectly,
    setSeedDirectly,
  };
}
