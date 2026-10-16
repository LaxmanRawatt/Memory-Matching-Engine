import React, { useState } from 'react';
import { DifficultyConfig } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../utils/adaptation';
import { RotateCcw, Clock, Move, CheckCircle2, Shuffle, Copy, Check, Gauge } from 'lucide-react';

interface StatsBarProps {
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  elapsedTimeSec: number;
  difficulty: DifficultyConfig;
  seed: string;
  roundNumber: number;
  onRestart: () => void;
  onSeedChange: (newSeed: string) => void;
  onDifficultyChange: (diffId: keyof typeof DIFFICULTY_CONFIGS) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  moves,
  matchedPairs,
  totalPairs,
  elapsedTimeSec,
  difficulty,
  seed,
  roundNumber,
  onRestart,
  onSeedChange,
  onDifficultyChange,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingSeed, setIsEditingSeed] = useState<boolean>(false);
  const [seedInput, setSeedInput] = useState<string>(seed);

  const progressPercent = Math.round((matchedPairs / totalPairs) * 100);
  const accuracy = moves > 0 ? Math.round((matchedPairs / moves) * 100) : 100;

  // Format seconds to mm:ss.s
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const tenths = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (seedInput.trim()) {
      onSeedChange(seedInput.trim());
      setIsEditingSeed(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3">
      {/* Top Meta Bar: Round, Difficulty selector, Seed reproducibility */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 font-semibold">
            Round #{roundNumber}
          </span>
          <span className="text-slate-600">|</span>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={difficulty.id}
              onChange={(e) => onDifficultyChange(e.target.value as keyof typeof DIFFICULTY_CONFIGS)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              aria-label="Select Game Difficulty"
            >
              {Object.values(DIFFICULTY_CONFIGS).map((cfg) => (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.name} ({cfg.pairs} pairs)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reproducible Seed Control */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Seed:</span>
          {isEditingSeed ? (
            <form onSubmit={handleSaveSeed} className="flex items-center gap-1">
              <input
                type="text"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className="bg-slate-800 border border-indigo-500 rounded px-1.5 py-0.5 text-xs font-mono text-indigo-200 w-24 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setIsEditingSeed(false)}
                className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[11px]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80">
              <span
                onClick={() => setIsEditingSeed(true)}
                className="font-mono text-indigo-300 font-semibold cursor-pointer hover:underline"
                title="Click to edit seed manually"
              >
                {seed}
              </span>
              <button
                onClick={handleCopySeed}
                className="p-1 hover:text-white text-slate-400 transition-colors"
                title="Copy Seed to clipboard"
                aria-label="Copy Seed"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={() => onSeedChange('')}
                className="p-1 hover:text-white text-slate-400 transition-colors"
                title="Randomize Seed"
                aria-label="Randomize Seed"
              >
                <Shuffle className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Metrics Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Moves Card */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Moves</div>
              <div className="text-lg font-mono font-bold text-slate-100">{moves}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Target: ≤{difficulty.promoMovesThreshold}</div>
            <div className="text-[10px] font-mono text-slate-300">Opt: {totalPairs}</div>
          </div>
        </div>

        {/* Pairs Matched Card */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pairs</div>
                <div className="text-lg font-mono font-bold text-slate-100">
                  {matchedPairs} <span className="text-xs text-slate-500 font-normal">/ {totalPairs}</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {progressPercent}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Active Time Card */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Time</div>
              <div className="text-lg font-mono font-bold text-sky-300">
                {formatTime(elapsedTimeSec)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Target</div>
            <div className="text-[10px] font-mono text-slate-300">≤{difficulty.promoTimeThresholdSec}s</div>
          </div>
        </div>

        {/* Restart Button Card */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex flex-col pl-2">
            <span className="text-[11px] font-medium text-slate-400">Accuracy</span>
            <span className="text-sm font-mono font-bold text-indigo-300">
              {accuracy}%
            </span>
          </div>
          <button
            onClick={onRestart}
            className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/30 active:scale-95 transition-all"
            title="Reset game and cancel all pending timers"
            aria-label="Restart Round"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
