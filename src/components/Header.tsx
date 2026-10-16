import React, { useState } from 'react';
import { Brain, Volume2, VolumeX, HelpCircle, History, PlayCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  onOpenInstructions: () => void;
  onOpenHistory: () => void;
  onOpenDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenInstructions,
  onOpenHistory,
  onOpenDemo,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="w-full max-w-5xl mx-auto pt-6 pb-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80">
      {/* Brand Title and Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              CEREVYN
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
              PS09 Adaptive
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Memory Matching Engine with Explainable Difficulty Scaling
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Interactive Demo Runner Button */}
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
          title="Open interactive check suite (Match, Mismatch, Rapid clicks, Timer restart, Adaptation)"
          aria-label="Open Interactive Verification Suite"
        >
          <PlayCircle className="w-4 h-4 text-emerald-400" />
          <span>Interactive Demos</span>
        </button>

        {/* Session History */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          title="View anonymous session results and adaptation trajectory"
          aria-label="View Session History"
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>History</span>
        </button>

        {/* How to Play / Rules */}
        <button
          onClick={onOpenInstructions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          title="Game instructions and adaptive difficulty algorithm rules"
          aria-label="Game Rules & Instructions"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Rules</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleMute}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
