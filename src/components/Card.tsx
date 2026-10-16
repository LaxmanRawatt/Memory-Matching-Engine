import React from 'react';
import { CardItem } from '../types/game';
import { CardIcon } from './CardIcon';
import { Check, Sparkles } from 'lucide-react';

interface CardProps {
  card: CardItem;
  index: number;
  isLocked: boolean;
  onClick: (index: number) => void;
}

export const Card: React.FC<CardProps> = ({ card, index, isLocked, onClick }) => {
  const isFlipped = card.state === 'flipped' || card.state === 'matched' || card.state === 'mismatched';
  const isMatched = card.state === 'matched';
  const isMismatched = card.state === 'mismatched';
  const isClickable = !isLocked && card.state === 'hidden';

  const handleClick = () => {
    if (isClickable) {
      onClick(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`Card ${index + 1}: ${isFlipped ? card.label : 'Hidden card'}${isMatched ? ' (Matched)' : ''}`}
      aria-pressed={isFlipped}
      aria-disabled={!isClickable}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`card-${index}`}
      data-card-state={card.state}
      data-pair-id={card.pairId}
      className={`relative w-full aspect-square rounded-2xl select-none cursor-pointer perspective-1000 transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        isClickable ? 'hover:scale-[1.03] active:scale-[0.98]' : ''
      } ${!isClickable && !isMatched ? 'cursor-not-allowed opacity-90' : ''}`}
    >
      <div
        className={`w-full h-full duration-500 transform-style-3d transition-transform relative rounded-2xl shadow-lg ${
          isFlipped ? 'rotate-y-180' : ''
        } ${isMismatched ? 'animate-shake' : ''} ${isMatched ? 'animate-match' : ''}`}
      >
        {/* CARD BACK (HIDDEN) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl backface-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/60 flex flex-col items-center justify-center p-3 shadow-inner group overflow-hidden"
        >
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:12px_12px]" />
          
          <div className="relative w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-600/50 flex items-center justify-center text-indigo-400/80 group-hover:text-indigo-300 group-hover:border-indigo-500/50 group-hover:scale-110 transition-all duration-300 shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <span className="relative mt-2 text-[10px] font-mono tracking-widest uppercase text-slate-400/70 font-semibold">
            Cerevyn
          </span>
        </div>

        {/* CARD FRONT (FLIPPED / MATCHED / MISMATCHED) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-3 transition-colors duration-300 border shadow-xl ${
            isMatched
              ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/60 shadow-emerald-950/40'
              : isMismatched
              ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/60 shadow-rose-950/40'
              : 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border-indigo-500/50 shadow-indigo-950/40'
          }`}
        >
          {/* Top-right matched indicator */}
          {isMatched && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}

          {/* Central Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 ${card.color} ${
              isMatched ? 'scale-110' : ''
            }`}
          >
            <CardIcon name={card.iconName} className="w-8 h-8 drop-shadow-md" />
          </div>

          {/* Card Label */}
          <span
            className={`mt-2 text-xs font-bold tracking-wide transition-colors ${
              isMatched
                ? 'text-emerald-300'
                : isMismatched
                ? 'text-rose-300'
                : 'text-slate-200'
            }`}
          >
            {card.label}
          </span>

          {/* Bottom Pair ID pill */}
          <span className="mt-1 text-[9px] font-mono text-slate-500">
            #{card.pairId + 1}
          </span>
        </div>
      </div>
    </div>
  );
};
