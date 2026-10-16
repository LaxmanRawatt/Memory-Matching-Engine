import React from 'react';
import { X, BookOpen, Brain, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { DIFFICULTY_CONFIGS } from '../utils/adaptation';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close Rules Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 id="instructions-modal-title" className="text-xl font-bold text-white">
              Rules & Adaptive Architecture
            </h2>
            <p className="text-xs text-slate-400">
              PS09 Cognitive Performance Specification & Game Logic
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300">
          {/* Section 1: Gameplay Fundamentals */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              1. Core Mechanics
            </h3>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Starting Grid:</strong> Default match begins on a <strong>4x4 grid containing 8 pairs</strong> (16 cards).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Moves Tracking:</strong> Revealing two cards constitutes 1 move. The optimal benchmark for 8 pairs is 8 moves (100% accuracy).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Reproducible Seeds:</strong> Shuffling utilizes a deterministic Mulberry32 PRNG. The same seed generates identical card positions.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 2: Game-State Correctness & Controls */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              2. Strict State Machine & Timer Guards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-slate-200 block mb-1">Anti-Spam Board Lock:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When two unmatched cards are flipped, the board enters a locked state. Any rapid 3rd click is strictly rejected until cards flip back.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-slate-200 block mb-1">Idempotent Clicks:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Repeat clicks on the same revealed card and clicks on already matched cards are completely ignored with zero side-effects.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 sm:col-span-2">
                <strong className="text-slate-200 block mb-1">Pending Timer Neutralization:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Clicking Restart clears all pending asynchronous timeouts immediately. Callbacks from an aborted game cannot execute in the new round.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Explainable Adaptive Difficulty Algorithm */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              3. Adaptive Difficulty Matrix & Documented Thresholds
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              At the conclusion of each round, performance is scored against explicit move and active-time thresholds:
            </p>

            {/* Threshold Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-2">Level</th>
                    <th className="py-2 px-2">Grid & Pairs</th>
                    <th className="py-2 px-2">Peek Window</th>
                    <th className="py-2 px-2 text-emerald-400">Promotion Threshold</th>
                    <th className="py-2 px-2 text-rose-400">Demotion Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-[11px]">
                  {Object.values(DIFFICULTY_CONFIGS).map((lvl) => (
                    <tr key={lvl.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-2 font-bold text-slate-200">{lvl.name}</td>
                      <td className="py-2.5 px-2 text-slate-300">{lvl.rows}x{lvl.cols} ({lvl.pairs} pairs)</td>
                      <td className="py-2.5 px-2 text-slate-400">{lvl.mismatchDelayMs}ms</td>
                      <td className="py-2.5 px-2 text-emerald-300">
                        {lvl.promoMovesThreshold < 999
                          ? `≤ ${lvl.promoMovesThreshold} moves & ≤ ${lvl.promoTimeThresholdSec}s`
                          : 'MAX LEVEL'}
                      </td>
                      <td className="py-2.5 px-2 text-rose-300">
                        {lvl.demoMovesThreshold < 999
                          ? `> ${lvl.demoMovesThreshold} moves or > ${lvl.demoTimeThresholdSec}s`
                          : 'MIN LEVEL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
