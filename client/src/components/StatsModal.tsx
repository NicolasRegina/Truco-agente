import React from 'react';
import { PlayerStats } from '@truco/core';
import { Trophy, Flame, EyeOff, CheckCircle2, X } from 'lucide-react';

interface StatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const bluffRate = stats.bluffsAttempted > 0 ? Math.round((stats.bluffsSuccessful / stats.bluffsAttempted) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-speech">
      <div className="bg-wood-border max-w-sm sm:max-w-md w-full rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-500/60 text-amber-100 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-black text-amber-300">Estadísticas Criollas</h3>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/40 border border-amber-800/40 rounded-2xl p-3 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Partidas Jugadas</span>
            <span className="text-2xl font-black text-white mt-0.5">{stats.gamesPlayed}</span>
          </div>

          <div className="bg-black/40 border border-amber-800/40 rounded-2xl p-3 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">% Victorias</span>
            <span className="text-2xl font-black text-emerald-300 mt-0.5">{winRate}%</span>
          </div>

          <div className="bg-black/40 border border-amber-800/40 rounded-2xl p-3 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Racha Actual
            </div>
            <span className="text-2xl font-black text-amber-200 mt-0.5">{stats.currentStreak} 🔥</span>
          </div>

          <div className="bg-black/40 border border-amber-800/40 rounded-2xl p-3 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Racha Máxima</span>
            <span className="text-2xl font-black text-amber-200 mt-0.5">{stats.maxStreak} 🏆</span>
          </div>
        </div>

        {/* Bluffing & Falta Envido summary */}
        <div className="space-y-2 bg-black/30 border border-amber-900/50 rounded-2xl p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-stone-300">
              <EyeOff className="w-4 h-4 text-purple-400" /> Efectividad de Mentiras
            </span>
            <strong className="text-purple-300 font-bold">{bluffRate}% ({stats.bluffsSuccessful}/{stats.bluffsAttempted})</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Faltas Envido Ganadas
            </span>
            <strong className="text-emerald-300 font-bold">{stats.faltaEnvidoWon}</strong>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl shadow transition-all"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
