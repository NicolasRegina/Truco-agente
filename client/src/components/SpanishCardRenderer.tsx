import React from 'react';
import { Card, Suit, CardValue } from '@truco/core';

interface SpanishCardRendererProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SpanishCardRenderer: React.FC<SpanishCardRendererProps> = ({
  card,
  size = 'md',
  className = '',
}) => {
  const suit = card.suit;
  const value = card.value as CardValue;

  const sizeClasses = {
    sm: 'w-16 h-24 text-xs rounded-md',
    md: 'w-24 h-36 sm:w-28 sm:h-40 text-sm rounded-lg',
    lg: 'w-32 h-48 sm:w-36 sm:h-52 text-base rounded-xl'
  }[size];

  // Colors & styling based on suit
  const suitColors = {
    espada: { border: 'border-blue-900', text: 'text-blue-950', badge: 'bg-blue-800' },
    basto: { border: 'border-amber-950', text: 'text-amber-950', badge: 'bg-amber-900' },
    oro: { border: 'border-amber-700', text: 'text-amber-950', badge: 'bg-amber-600' },
    copa: { border: 'border-rose-900', text: 'text-rose-950', badge: 'bg-rose-800' }
  }[suit];

  return (
    <div
      className={`
        ${sizeClasses}
        bg-[#faf6ee] ${suitColors.text}
        border-2 border-stone-400 shadow-card
        flex flex-col justify-between p-1.5 sm:p-2 relative select-none overflow-hidden
        ${className}
      `}
    >
      {/* Traditional Spanish deck double border (Pinta / Margen) */}
      <div className={`absolute inset-1 border border-stone-300 rounded pointer-events-none`}>
        <div className={`absolute inset-0.5 border ${suit === 'espada' ? 'border-sky-800/40' : suit === 'basto' ? 'border-emerald-800/40' : suit === 'oro' ? 'border-amber-700/40' : 'border-rose-800/40'} rounded-sm`}></div>
      </div>

      {/* Top Left Index */}
      <div className="flex items-center justify-between leading-none z-10">
        <div className="flex flex-col items-center">
          <span className="text-base sm:text-lg font-black font-serif text-stone-900 leading-none">{value}</span>
          <div className="mt-0.5"><SpanishMiniSuit suit={suit} /></div>
        </div>
      </div>

      {/* Center Artwork: Figures (10, 11, 12) or Pips (1-7) */}
      <div className="flex-1 flex items-center justify-center my-0.5 z-10 w-full overflow-hidden">
        {value >= 10 ? (
          <SpanishFigureComposition value={value as 10 | 11 | 12} suit={suit} />
        ) : (
          <SpanishPipComposition value={value} suit={suit} size={size} />
        )}
      </div>

      {/* Bottom Right Index (Inverted) */}
      <div className="flex items-center justify-between rotate-180 leading-none z-10">
        <div className="flex flex-col items-center">
          <span className="text-base sm:text-lg font-black font-serif text-stone-900 leading-none">{value}</span>
          <div className="mt-0.5"><SpanishMiniSuit suit={suit} /></div>
        </div>
      </div>
    </div>
  );
};

// Pure Spanish Mini Suit Icons (Clean, NO poker clubs!)
export const SpanishMiniSuit: React.FC<{ suit: Suit }> = ({ suit }) => {
  if (suit === 'espada') {
    return (
      <svg className="w-3.5 h-3.5 text-sky-800" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L14.5 7L13 8L13 18L15 19L15 21L12 20L9 21L9 19L11 18L11 8L9.5 7L12 1Z" />
      </svg>
    );
  }
  if (suit === 'basto') {
    // Pure Wooden Club with leaves (NO poker ♣)
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C8 4 8.5 8 9.5 12L9 18H11L10.5 12C11.5 8 12 4 10 2Z" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
        <circle cx="7.5" cy="8" r="1.5" fill="#16a34a" />
        <circle cx="12.5" cy="11" r="1.5" fill="#16a34a" />
      </svg>
    );
  }
  if (suit === 'oro') {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        <circle cx="10" cy="10" r="4" fill="#fef08a" />
      </svg>
    );
  }
  // Copa
  return (
    <svg className="w-3.5 h-3.5 text-rose-800" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 3H17V8C17 11 14.5 13.5 12 13.5C9.5 13.5 7 11 7 8V3ZM11 13.5V19H8V21H16V19H13V13.5" />
    </svg>
  );
};

// Large Spanish Suit Pip
export const SpanishPip: React.FC<{ suit: Suit; size?: 'sm' | 'md' | 'lg' | 'giant' }> = ({ suit, size = 'md' }) => {
  const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';

  if (suit === 'espada') {
    return (
      <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
        <path d="M20 2L24 16L23 54H17L16 16L20 2Z" fill="url(#spSwordBlade)" stroke="#1e3a8a" strokeWidth="1.2" />
        <line x1="20" y1="12" x2="20" y2="50" stroke="#93c5fd" strokeWidth="1.2" />
        <path d="M10 54H30C32 54 32 58 30 58H10C8 58 8 54 10 54Z" fill="url(#spGold)" stroke="#78350f" strokeWidth="1" />
        <rect x="18" y="58" width="4" height="14" rx="1" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" />
        <circle cx="20" cy="75" r="4" fill="url(#spGold)" stroke="#78350f" strokeWidth="1" />
        <defs>
          <linearGradient id="spSwordBlade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="spGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (suit === 'basto') {
    return (
      <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
        <path d="M14 6C11 12 13 22 15 32L14 68C14 74 26 74 26 68L25 32C27 22 29 12 26 6C23 3 17 3 14 6Z" fill="url(#spWood)" stroke="#451a03" strokeWidth="1.5" />
        {/* Knots & Laurel Leaves */}
        <circle cx="12" cy="18" r="3.5" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        <circle cx="28" cy="28" r="3.5" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        <circle cx="12" cy="44" r="3" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        <circle cx="27" cy="54" r="3" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        <defs>
          <linearGradient id="spWood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (suit === 'oro') {
    const oroDim = size === 'giant' ? 'w-20 h-20' : size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
    return (
      <svg className={`${oroDim} drop-shadow-sm`} viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="28" fill="url(#spGoldCoin)" stroke="#78350f" strokeWidth="2" />
        <circle cx="30" cy="30" r="21" fill="url(#spGoldCenter)" stroke="#b45309" strokeWidth="1.5" />
        {/* Sun rays */}
        <g stroke="#92400e" strokeWidth="1.5" strokeLinecap="round">
          <line x1="30" y1="12" x2="30" y2="16" />
          <line x1="30" y1="44" x2="30" y2="48" />
          <line x1="12" y1="30" x2="16" y2="30" />
          <line x1="44" y1="30" x2="48" y2="30" />
        </g>
        <circle cx="30" cy="30" r="8" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
        <defs>
          <radialGradient id="spGoldCoin" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="spGoldCenter" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  // Copa
  return (
    <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 50 65" fill="none">
      <path d="M12 6H38C38 6 41 22 36 28C31 34 27 35 25 36C23 35 19 34 14 28C9 22 12 6 12 6Z" fill="url(#spCopa)" stroke="#78350f" strokeWidth="1.5" />
      <ellipse cx="25" cy="10" rx="11" ry="3" fill="#991b1b" />
      <rect x="23" y="36" width="4" height="15" fill="url(#spGold)" stroke="#78350f" strokeWidth="1" />
      <path d="M15 58C15 54 20 51 25 51C30 51 35 54 35 58H15Z" fill="url(#spGold)" stroke="#78350f" strokeWidth="1.5" />
      <defs>
        <linearGradient id="spCopa" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Figures discriminated by suit (10 Sota, 11 Caballo, 12 Rey)
const SpanishFigureComposition: React.FC<{ value: 10 | 11 | 12; suit: Suit }> = ({ value, suit }) => {
  const suitName = suit === 'espada' ? 'Espadas' : suit === 'basto' ? 'Bastos' : suit === 'oro' ? 'Oros' : 'Copas';
  const figureTitle = value === 10 ? `SOTA DE ${suitName.toUpperCase()}` : value === 11 ? `CABALLO DE ${suitName.toUpperCase()}` : `REY DE ${suitName.toUpperCase()}`;

  const suitColor = suit === 'espada' ? 'bg-sky-800' : suit === 'basto' ? 'bg-amber-900' : suit === 'oro' ? 'bg-amber-600' : 'bg-rose-800';

  return (
    <div className="flex flex-col items-center justify-center p-1 bg-amber-50/90 rounded-lg border border-amber-900/30 shadow-inner w-full max-w-[90px]">
      <div className="w-12 h-12 rounded-full border-2 border-amber-600/80 bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center shadow-md relative">
        {value === 10 && <span className="text-2xl drop-shadow">🧑‍🌾</span>}
        {value === 11 && <span className="text-2xl drop-shadow">🐎</span>}
        {value === 12 && <span className="text-2xl drop-shadow">👑</span>}

        {/* Floating Mini Suit on Figure */}
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow border border-stone-300">
          <SpanishMiniSuit suit={suit} />
        </div>
      </div>

      <span className={`text-[7px] sm:text-[8px] font-black text-white px-1.5 py-0.5 rounded mt-1.5 ${suitColor} tracking-tighter uppercase text-center shadow-sm w-full truncate`}>
        {figureTitle}
      </span>
    </div>
  );
};

// Pip Arrangements (1 to 7)
const SpanishPipComposition: React.FC<{ value: CardValue; suit: Suit; size: 'sm' | 'md' | 'lg' }> = ({
  value,
  suit,
  size
}) => {
  if (value === 1) {
    return (
      <div className="flex items-center justify-center">
        <SpanishPip suit={suit} size="giant" />
      </div>
    );
  }

  if (value === 2) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1 gap-2">
        <SpanishPip suit={suit} size={size === 'sm' ? 'sm' : 'md'} />
        <SpanishPip suit={suit} size={size === 'sm' ? 'sm' : 'md'} />
      </div>
    );
  }

  if (value === 3) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1">
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
      </div>
    );
  }

  if (value === 4) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-2 items-center justify-center p-1">
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
      </div>
    );
  }

  if (value === 5) {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <SpanishPip suit={suit} size="sm" />
        </div>
      </div>
    );
  }

  if (value === 6) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 items-center justify-center">
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
        <SpanishPip suit={suit} size="sm" />
      </div>
    );
  }

  if (value === 7) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
          <SpanishPip suit={suit} size="sm" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <SpanishPip suit={suit} size="sm" />
        </div>
      </div>
    );
  }

  return <SpanishPip suit={suit} size="md" />;
};
