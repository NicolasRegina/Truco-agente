import React, { useState } from 'react';
import { soundFx } from '../utils/soundController';

interface InteractiveMateProps {
  mateStyle?: string;
  onDrink?: () => void;
}

export const InteractiveMate: React.FC<InteractiveMateProps> = ({
  mateStyle = 'calabaza',
  onDrink
}) => {
  const [isDrinking, setIsDrinking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const matePhrases = [
    '🧉 ¡Unos amargos y a ganar!',
    '🧉 ¡Cebá otro mientras piensa!',
    '🧉 ¡Mate caliente, truco ardiente!',
    '🧉 ¡Manso mate, amigo!',
    '🧉 ¡Ponele yerba que está lavado!',
    '🧉 ¡Gracias por la yerba!',
    '🧉 ¡Salud!'
  ];

  const handleDrink = () => {
    if (isDrinking) return;
    setIsDrinking(true);
    soundFx.playMateSlurp();
    if (onDrink) onDrink();

    const randomMsg = matePhrases[Math.floor(Math.random() * matePhrases.length)];
    setMessage(randomMsg);

    setTimeout(() => {
      setIsDrinking(false);
    }, 1200);

    setTimeout(() => {
      setMessage(null);
    }, 2800);
  };

  // Color & texture mapping according to equipped mate style
  const getMateVisuals = () => {
    switch (mateStyle) {
      case 'algarrobo':
        return {
          bodyGrad1: '#b45309',
          bodyGrad2: '#78350f',
          stroke: '#451a03',
          rimGrad1: '#fde047',
          rimGrad2: '#ca8a04',
          label: 'Algarrobo'
        };
      case 'camionero':
        return {
          bodyGrad1: '#522b16',
          bodyGrad2: '#271306',
          stroke: '#1c0a02',
          rimGrad1: '#e2e8f0',
          rimGrad2: '#94a3b8',
          label: 'Camionero'
        };
      case 'imperial':
        return {
          bodyGrad1: '#18181b',
          bodyGrad2: '#09090b',
          stroke: '#000000',
          rimGrad1: '#f8fafc',
          rimGrad2: '#cbd5e1',
          label: 'Imperial'
        };
      case 'stanley':
        return {
          bodyGrad1: '#2e4f34',
          bodyGrad2: '#1a3320',
          stroke: '#0d1a10',
          rimGrad1: '#f1f5f9',
          rimGrad2: '#94a3b8',
          label: 'Térmico'
        };
      default: // calabaza
        return {
          bodyGrad1: '#854d0e',
          bodyGrad2: '#451a03',
          stroke: '#271306',
          rimGrad1: '#e2e8f0',
          rimGrad2: '#64748b',
          label: 'Calabaza'
        };
    }
  };

  const visuals = getMateVisuals();

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
        title={`Tomar mate (${visuals.label})`}
      >
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 50 60" fill="none">
          {/* Silver Bombilla */}
          <line x1="32" y1="6" x2="22" y2="34" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <line x1="33" y1="8" x2="23" y2="34" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          <circle cx="34" cy="5" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

          {/* Gourd Calabash Body */}
          <ellipse cx="25" cy="38" rx="18" ry="18" fill="url(#mateBodyGrad)" stroke={visuals.stroke} strokeWidth="2" />
          <ellipse cx="25" cy="22" rx="13" ry="5" fill="#15803d" stroke={visuals.stroke} strokeWidth="1.5" />

          {/* Virola Top Rim */}
          <ellipse cx="25" cy="20" rx="14" ry="4.5" fill="url(#mateRimGrad)" stroke="#475569" strokeWidth="1" />

          {/* Yerba Mate Leaf Center */}
          <ellipse cx="25" cy="22" rx="9" ry="3" fill="#14532d" />
          <circle cx="28" cy="21" r="1.5" fill="#166534" />

          {/* Gradients */}
          <defs>
            <linearGradient id="mateBodyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={visuals.bodyGrad1} />
              <stop offset="100%" stopColor={visuals.bodyGrad2} />
            </linearGradient>
            <linearGradient id="mateRimGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={visuals.rimGrad1} />
              <stop offset="100%" stopColor={visuals.rimGrad2} />
            </linearGradient>
          </defs>
        </svg>

        {/* Small style indicator badge on hover */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] bg-stone-900/90 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40 whitespace-nowrap">
          {visuals.label}
        </span>
      </button>
    </div>
  );
};
