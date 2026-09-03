import React, { useState } from 'react';
import { soundFx } from '../utils/soundController';

export const InteractiveMate: React.FC = () => {
  const [isDrinking, setIsDrinking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const matePhrases = [
    '🧉 ¡Unos amargos y a ganar!',
    '🧉 ¡Cebá otro mientras piensa!',
    '🧉 ¡Mate caliente, truco ardiente!',
    '🧉 ¡Manso mate criollo!'
  ];

  const handleDrink = () => {
    if (isDrinking) return;
    setIsDrinking(true);
    soundFx.playMateSlurp();

    const randomMsg = matePhrases[Math.floor(Math.random() * matePhrases.length)];
    setMessage(randomMsg);

    setTimeout(() => {
      setIsDrinking(false);
    }, 1200);

    setTimeout(() => {
      setMessage(null);
    }, 2800);
  };

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Speech bubble when sipping */}
      {message && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-amber-100 text-stone-950 font-black text-[10px] rounded-xl shadow-lg border border-amber-400 whitespace-nowrap animate-speech z-40">
          {message}
        </div>
      )}

      {/* Mate Gourd Button */}
      <button
        onClick={handleDrink}
        className={`relative w-12 h-14 sm:w-14 sm:h-16 transition-transform active:scale-90 group cursor-pointer ${
          isDrinking ? 'scale-110 -rotate-6' : 'hover:scale-105'
        }`}
        title="Tocar para tomar un mate"
      >
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 50 60" fill="none">
          {/* Silver Bombilla */}
          <line x1="32" y1="6" x2="22" y2="34" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <line x1="33" y1="8" x2="23" y2="34" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          <circle cx="34" cy="5" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

          {/* Gourd Calabash Body */}
          <ellipse cx="25" cy="38" rx="18" ry="18" fill="url(#mateLeather)" stroke="#271306" strokeWidth="2" />
          <ellipse cx="25" cy="22" rx="13" ry="5" fill="#15803d" stroke="#271306" strokeWidth="1.5" />

          {/* Silver Virola Top Rim */}
          <ellipse cx="25" cy="20" rx="14" ry="4.5" fill="url(#silverRim)" stroke="#475569" strokeWidth="1" />

          {/* Yerba mate foam inside */}
          <circle cx="23" cy="22" r="6" fill="#166534" />
          <circle cx="27" cy="23" r="4" fill="#14532d" />

          <defs>
            <radialGradient id="mateLeather" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="60%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0a02" />
            </radialGradient>
            <linearGradient id="silverRim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated Steam vapor particles */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-70 pointer-events-none">
          <span className="w-1 h-3 bg-amber-100/60 rounded-full blur-[1px] animate-pulse"></span>
          <span className="w-1 h-4 bg-amber-100/40 rounded-full blur-[1px] animate-pulse delay-100"></span>
        </div>
      </button>
      <span className="text-[8px] font-black text-amber-300/80 uppercase tracking-tighter mt-0.5">El Mate</span>
    </div>
  );
};
