import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Trash2,
  Trophy,
  Clock,
  Move,
  Activity,
} from 'lucide-react';
import {
  getStoredSessionRounds,
  clearSessionHistory,
  computeSessionAnalytics,
  getAnonymousSessionId,
} from '../utils/storage';
import { GameSessionRecord } from '../types/game';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<GameSessionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<GameSessionRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecords(getStoredSessionRounds());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const analytics = computeSessionAnalytics(records);
  const anonId = getAnonymousSessionId();

  const handleClear = () => {
    if (window.confirm('Clear all stored anonymous session history?')) {
      clearSessionHistory();
      setRecords([]);
      setSelectedRecord(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cerevyn_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close History Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-xl font-bold text-white">
                Anonymous Session History
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Device Token: {anonId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mr-8">
            {records.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                  title="Export anonymous JSON telemetry"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Aggregate KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Rounds</div>
              <div className="text-base font-mono font-bold text-slate-100">{analytics.totalRounds}</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Move className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Moves</div>
              <div className="text-base font-mono font-bold text-slate-100">{analytics.averageMoves || '—'}</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Time</div>
              <div className="text-base font-mono font-bold text-slate-100">
                {analytics.averageTimeSec ? `${analytics.averageTimeSec}s` : '—'}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Promotions</div>
              <div className="text-base font-mono font-bold text-emerald-400">
                {analytics.promotionsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No session rounds recorded yet. Complete a game to see adaptive telemetry.
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((rec, i) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(isSelected ? null : rec)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500/60'
                        : 'bg-slate-950/50 hover:bg-slate-850/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">
                          #{records.length - i}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {rec.difficultyName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          Seed: {rec.seed}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-300">
                          {rec.moves} moves
                        </span>
                        <span className="font-mono text-sky-400">
                          {rec.elapsedTimeSec.toFixed(1)}s
                        </span>
                        <span className="font-mono text-indigo-400 font-bold">
                          {rec.accuracy}%
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            rec.adaptation.action === 'promoted'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : rec.adaptation.action === 'demoted'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {rec.adaptation.action === 'promoted' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : rec.adaptation.action === 'demoted' ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          {rec.adaptation.action}
                        </span>
                      </div>
                    </div>

                    {/* Drill-down Reason on selection */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg">
                        <div className="font-semibold text-indigo-300 mb-1">
                          Adaptation Rationale:
                        </div>
                        <p>{rec.adaptation.reason}</p>
                        <div className="text-[10px] text-slate-500 mt-2 font-mono">
                          Timestamp: {new Date(rec.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
