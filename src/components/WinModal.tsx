import React from 'react';
import { AdaptationResult, DifficultyConfig } from '../types/game';
import {
  Trophy,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  Award,
} from 'lucide-react';

interface WinModalProps {
  isOpen: boolean;
  moves: number;
  elapsedTimeSec: number;
  difficulty: DifficultyConfig;
  adaptation: AdaptationResult | null;
  onNextRound: () => void;
  onPlayAgain: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  moves,
  elapsedTimeSec,
  difficulty,
  adaptation,
  onNextRound,
  onPlayAgain,
}) => {
  if (!isOpen || !adaptation) return null;

  const optimalMoves = difficulty.pairs;
  const accuracy = Math.round((optimalMoves / moves) * 100);

  // Compute Rank based on accuracy and speed
  const getRank = () => {
    if (accuracy >= 85) return { grade: 'S-Tier', color: 'text-amber-400', stars: 3 };
    if (accuracy >= 65) return { grade: 'A-Tier', color: 'text-indigo-400', stars: 2 };
    return { grade: 'B-Tier', color: 'text-sky-400', stars: 1 };
  };

  const rank = getRank();

  // Action badge styling
  const getActionBadge = () => {
    switch (adaptation.action) {
      case 'promoted':
        return {
          label: 'PROMOTED',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: TrendingUp,
        };
      case 'demoted':
        return {
          label: 'EASED / DEMOTED',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: TrendingDown,
        };
      case 'maintained':
      default:
        return {
          label: 'MAINTAINED',
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: Minus,
        };
    }
  };

  const actionBadge = getActionBadge();
  const ActionIcon = actionBadge.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-modal-title"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header with Trophy */}
        <div className="text-center relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h2
            id="win-modal-title"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          >
            Round Cleared!
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            {[...Array(rank.stars)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className={`text-xs font-bold uppercase ml-1 ${rank.color}`}>
              {rank.grade} Performance
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Moves</div>
            <div className="text-lg font-mono font-bold text-slate-100">{moves}</div>
            <div className="text-[10px] text-slate-500">Opt: {optimalMoves}</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Time</div>
            <div className="text-lg font-mono font-bold text-sky-400">{elapsedTimeSec.toFixed(1)}s</div>
            <div className="text-[10px] text-slate-500">Target: ≤{difficulty.promoTimeThresholdSec}s</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Accuracy</div>
            <div className="text-lg font-mono font-bold text-indigo-400">{accuracy}%</div>
            <div className="text-[10px] text-slate-500">Score: {adaptation.compositeScore}/100</div>
          </div>
        </div>

        {/* EXPLAINABLE ADAPTATION BREAKDOWN PANEL */}
        <div className="bg-slate-950/70 rounded-2xl p-4 border border-indigo-500/20 my-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Adaptive Difficulty Engine Decision</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${actionBadge.bg}`}
            >
              <ActionIcon className="w-3.5 h-3.5" />
              {actionBadge.label}
            </span>
          </div>

          {/* Level Transition Pill */}
          <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl text-xs font-medium border border-slate-800">
            <div className="text-slate-400">
              Current: <span className="font-semibold text-slate-200">{adaptation.previousDifficulty.name}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            <div className="text-indigo-300">
              Next: <span className="font-bold text-white">{adaptation.nextDifficulty.name}</span>
            </div>
          </div>

          {/* Transparent Reason Statement */}
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {adaptation.reason}
          </p>

          {/* Metrics Threshold Status */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
              {adaptation.movesMetric.satisfied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="text-slate-400">
                Moves: <span className="font-mono text-slate-200 font-semibold">{adaptation.movesMetric.actual}</span> (limit {adaptation.movesMetric.threshold})
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
              {adaptation.timeMetric.satisfied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="text-slate-400">
                Time: <span className="font-mono text-slate-200 font-semibold">{adaptation.timeMetric.actual.toFixed(1)}s</span> (limit {adaptation.timeMetric.threshold}s)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
          <button
            onClick={onNextRound}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>Next Round ({adaptation.nextDifficulty.name})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayAgain}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Replay Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
