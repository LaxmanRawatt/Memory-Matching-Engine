import { useState } from 'react';
import { useMemoryGame } from './hooks/useMemoryGame';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { Grid } from './components/Grid';
import { WinModal } from './components/WinModal';
import { InstructionsModal } from './components/InstructionsModal';
import { HistoryModal } from './components/HistoryModal';
import { InteractiveDemoModal } from './components/InteractiveDemoModal';
import { ShieldCheck, Cpu, Code2 } from 'lucide-react';

export default function App() {
  const {
    cards,
    seed,
    difficulty,
    moves,
    matchedPairs,
    totalPairs,
    elapsedTimeSec,
    isLocked,
    isWon,
    lastAdaptation,
    roundNumber,
    handleCardClick,
    restartGame,
    advanceToNextRound,
    setDifficultyDirectly,
    setSeedDirectly,
  } = useMemoryGame({ initialDifficultyId: 'normal' });

  // Modal visibility states
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div aria-hidden="true" className="ambient-glow pointer-events-none absolute -top-48 left-1/2 -z-0 h-96 w-[min(90vw,56rem)] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
      {/* Top Application Header */}
      <Header
        onOpenInstructions={() => setIsInstructionsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col items-center justify-start w-full max-w-5xl mx-auto py-2">
        {/* Game Stats & Control Bar */}
        <StatsBar
          moves={moves}
          matchedPairs={matchedPairs}
          totalPairs={totalPairs}
          elapsedTimeSec={elapsedTimeSec}
          difficulty={difficulty}
          seed={seed}
          roundNumber={roundNumber}
          onRestart={() => restartGame()}
          onSeedChange={(newSeed) => setSeedDirectly(newSeed)}
          onDifficultyChange={(diffId) => setDifficultyDirectly(diffId)}
        />

        {/* Dynamic Card Grid */}
        <Grid
          cards={cards}
          cols={difficulty.cols}
          isLocked={isLocked}
          onCardClick={handleCardClick}
        />
      </main>

      {/* Footer & System Specs */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 border-t border-slate-900 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Deterministic PRNG Seeding
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Zero-Race Board State Lock
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-slate-400" />
          <span>PS09 Adaptive Engine • React 19 + TypeScript + Vitest</span>
        </div>
      </footer>

      {/* Win / Round Summary Modal */}
      <WinModal
        isOpen={isWon}
        moves={moves}
        elapsedTimeSec={elapsedTimeSec}
        difficulty={difficulty}
        adaptation={lastAdaptation}
        onNextRound={advanceToNextRound}
        onPlayAgain={() => restartGame(seed, difficulty)}
      />

      {/* Game Rules & Thresholds Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* Anonymous History & Telemetry Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Interactive Demonstration & Checks Modal */}
      <InteractiveDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        cards={cards}
        difficulty={difficulty}
        isLocked={isLocked}
        onCardClick={handleCardClick}
        onRestart={restartGame}
      />
    </div>
  );
}
