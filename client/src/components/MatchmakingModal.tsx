import React, { useEffect, useState } from 'react';
import { MatchConfig } from '@truco/core';
import { Loader2, X } from 'lucide-react';

interface MatchmakingModalProps {
  playerName: string;
  config: MatchConfig;
  onCancel: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  config,
  onCancel
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* Container Card */}
      <div className="relative w-full max-w-sm bg-stone-950/95 border-2 border-amber-500/60 rounded-3xl p-6 text-center text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center animate-speech">
        {/* Radar Animation */}
        <div className="relative w-24 h-24 my-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border border-amber-400/40 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-amber-500 border-l-transparent animate-spin"></div>
          
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-2xl flex items-center justify-center">
            <span className="text-3xl drop-shadow select-none">☀️</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-serif text-amber-400 mb-1">
          Partida Pública
        </h2>
        <p className="text-xs text-stone-300 mb-4 max-w-xs leading-relaxed">
          Buscando un rival en la pulpería virtual... En cuanto ingrese otro jugador en cola, la partida arrancará automáticamente.
        </p>

        {/* Live Timer Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-amber-600/40 text-amber-300 font-mono text-sm mb-5 shadow-inner">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Tiempo en cola: <strong>{formatTime(seconds)}</strong></span>
        </div>

        {/* Match Settings preview */}
        <div className="w-full bg-stone-900/80 rounded-2xl p-3 border border-stone-800 text-xs text-stone-300 flex justify-around mb-5">
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-bold">Objetivo</div>
            <div className="font-black text-amber-400">{config.maxScore} Puntos</div>
          </div>
          <div className="w-px bg-stone-800"></div>
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-bold">Flor</div>
            <div className="font-black text-amber-400">{config.withFlor ? 'Con Flor' : 'Sin Flor'}</div>
          </div>
          <div className="w-px bg-stone-800"></div>
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-bold">Baraja</div>
            <div className="font-black text-amber-400">Criolla</div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-3 px-4 bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 font-bold text-xs sm:text-sm rounded-2xl border border-stone-600 transition-all flex items-center justify-center gap-2 shadow"
        >
          <X className="w-4 h-4 text-stone-400" />
          <span>Cancelar Búsqueda</span>
        </button>
      </div>
    </div>
  );
};
