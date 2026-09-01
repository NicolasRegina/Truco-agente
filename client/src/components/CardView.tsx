import React from 'react';
import { Card, CardValue, Suit } from '@truco/core';

interface CardViewProps {
  card?: Card;
  isFlipped?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  selected?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFlipped = false,
  isPlayable = false,
  onClick,
  size = 'md',
  className = '',
  selected = false
}) => {
  const sizeClasses = {
    sm: 'w-16 h-24 text-xs rounded-md',
    md: 'w-24 h-36 sm:w-28 sm:h-40 text-sm rounded-lg',
    lg: 'w-32 h-48 sm:w-36 sm:h-52 text-base rounded-xl'
  }[size];

  // Render card back (flipped, hidden or covered/tapada)
  if (isFlipped || !card || card.id === 'hidden_card' || card.isCovered) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-red-900 via-stone-900 to-amber-950 border-2 border-amber-400/70 shadow-card flex items-center justify-center p-1 relative overflow-hidden transition-all duration-200 ${className}`}
      >
        {/* Intricate Argentine deck back with geometric border and gold filigree */}
        <div className="w-full h-full border border-amber-400/50 rounded flex flex-col items-center justify-center bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:10px_10px] gap-1 p-1">
          <div className="w-10 h-10 rounded-full border-2 border-amber-300 flex items-center justify-center bg-red-950 shadow-inner">
            <span className="text-amber-300 font-serif font-black text-sm tracking-widest">TRUCO</span>
          </div>
          {card?.isCovered && (
            <span className="text-[8px] font-black text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/60 uppercase tracking-wider">
              Tapada
            </span>
          )}
        </div>
      </div>
    );
  }

  // Trump highlights
  const isMacho = card.value === 1 && card.suit === 'espada';
  const isHembra = card.value === 1 && card.suit === 'basto';
  const isSieteEspada = card.value === 7 && card.suit === 'espada';
  const isSieteOro = card.value === 7 && card.suit === 'oro';
  const isTopTrump = isMacho || isHembra || isSieteEspada || isSieteOro;

  const trumpBadge = isMacho
    ? 'Macho'
    : isHembra
    ? 'Hembra'
    : isSieteEspada
    ? '7 Bravo'
    : isSieteOro
    ? '7 Bello'
    : null;

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        ${sizeClasses}
        bg-gradient-to-b from-stone-50 via-amber-50/90 to-amber-100/95
        text-stone-900 font-serif
        border-2 ${isTopTrump ? 'border-amber-500 ring-1 ring-amber-400' : 'border-stone-400/80'}
        ${isTopTrump ? (isMacho ? 'card-macho' : isHembra ? 'card-hembra' : 'card-siete-oro') : 'shadow-card'}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-card-hover active:scale-95 transition-transform' : ''}
        ${selected ? '-translate-y-4 ring-4 ring-amber-400' : ''}
        flex flex-col justify-between p-1.5 sm:p-2 relative select-none transition-all duration-200
        ${className}
      `}
    >
      {/* Ornate corner frame */}
      <div className="absolute inset-1 border border-amber-900/10 pointer-events-none rounded"></div>

      {/* Top Left corner index */}
      <div className="flex items-center justify-between leading-none z-10">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-black font-sans text-stone-950">{card.value}</span>
          <SuitMiniIcon suit={card.suit} />
        </div>
        {trumpBadge && (
          <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 uppercase tracking-tighter shadow-sm border border-amber-600/50">
            {trumpBadge}
          </span>
        )}
      </div>

      {/* Center authentic Spanish card artwork */}
      <div className="flex-1 flex items-center justify-center my-0.5 z-10 w-full overflow-hidden">
        <SpanishCardComposition card={card} size={size} />
      </div>

      {/* Bottom Right corner index (inverted) */}
      <div className="flex items-center justify-between rotate-180 leading-none z-10">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-black font-sans text-stone-950">{card.value}</span>
          <SuitMiniIcon suit={card.suit} />
        </div>
      </div>
    </div>
  );
};

// Mini icon for corners
const SuitMiniIcon: React.FC<{ suit: Suit }> = ({ suit }) => {
  switch (suit) {
    case 'espada':
      return (
        <svg className="w-3 h-3 text-sky-800" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L14.5 7L13 8L13 18L15 19L15 21L12 20L9 21L9 19L11 18L11 8L9.5 7L12 1Z" />
        </svg>
      );
    case 'basto':
      return (
        <svg className="w-3 h-3 text-emerald-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10 2 9 4 10 7C9 9 7 11 8 14C9 17 10 19 11 22H13C14 19 15 17 16 14C17 11 15 9 14 7C15 4 14 2 12 2Z" />
        </svg>
      );
    case 'oro':
      return (
        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" fill="#fef08a" />
        </svg>
      );
    case 'copa':
      return (
        <svg className="w-3 h-3 text-rose-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 3H17V8C17 11 14.5 13.5 12 13.5C9.5 13.5 7 11 7 8V3ZM11 13.5V19H8V21H16V19H13V13.5" />
        </svg>
      );
  }
};

// Detailed Vector Art for each Spanish Suit Element
export const EspadaVector: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'giant' }> = ({ size = 'md' }) => {
  const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
  return (
    <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
      {/* Blade */}
      <path d="M20 2L24 16L23 54H17L16 16L20 2Z" fill="url(#swordBladeGrad)" stroke="#1e3a8a" strokeWidth="1" />
      {/* Fuller line */}
      <line x1="20" y1="12" x2="20" y2="50" stroke="#93c5fd" strokeWidth="1" />
      {/* Crossguard */}
      <path d="M10 54H30C32 54 32 58 30 58H10C8 58 8 54 10 54Z" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1" />
      {/* Grip */}
      <rect x="18" y="58" width="4" height="14" rx="1" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" />
      <line x1="18" y1="62" x2="22" y2="62" stroke="#d97706" strokeWidth="0.8" />
      <line x1="18" y1="66" x2="22" y2="66" stroke="#d97706" strokeWidth="0.8" />
      {/* Pommel */}
      <circle cx="20" cy="75" r="4" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1" />
      <defs>
        <linearGradient id="swordBladeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const BastoVector: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'giant' }> = ({ size = 'md' }) => {
  const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
  return (
    <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
      {/* Knotted Club Trunk */}
      <path
        d="M17 76C15 76 14 72 15 65C14 55 12 40 14 25C13 18 16 6 20 4C24 6 27 18 26 25C28 40 26 55 25 65C26 72 25 76 23 76H17Z"
        fill="url(#woodGrad)"
        stroke="#27272a"
        strokeWidth="1.2"
      />
      {/* Knots & Bark texture */}
      <ellipse cx="18" cy="22" rx="3" ry="2" fill="#3f1e0d" />
      <ellipse cx="22" cy="42" rx="3" ry="2.5" fill="#3f1e0d" />
      <ellipse cx="19" cy="58" rx="2.5" ry="2" fill="#3f1e0d" />
      {/* Golden Ferrule Rings */}
      <rect x="15" y="66" width="10" height="3" rx="1" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="0.8" />
      {/* Green Vine Leaves */}
      <path d="M13 32C10 30 9 26 12 24C14 26 14 30 13 32Z" fill="#15803d" stroke="#052e16" strokeWidth="0.8" />
      <path d="M27 48C30 46 31 42 28 40C26 42 26 46 27 48Z" fill="#15803d" stroke="#052e16" strokeWidth="0.8" />
      <defs>
        <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="40%" stopColor="#92400e" />
          <stop offset="80%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const OroVector: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'giant' }> = ({ size = 'md' }) => {
  const dim = size === 'giant' ? 'w-20 h-20' : size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
  return (
    <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 60 60" fill="none">
      {/* Outer Coin Ring */}
      <circle cx="30" cy="30" r="28" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="2" />
      <circle cx="30" cy="30" r="24" stroke="#d97706" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="30" cy="30" r="21" fill="url(#goldCoinCenter)" stroke="#b45309" strokeWidth="1.5" />
      {/* Sun of May (Sol de Mayo) rays */}
      <g stroke="#92400e" strokeWidth="1.5" strokeLinecap="round">
        <line x1="30" y1="12" x2="30" y2="16" />
        <line x1="30" y1="44" x2="30" y2="48" />
        <line x1="12" y1="30" x2="16" y2="30" />
        <line x1="44" y1="30" x2="48" y2="30" />
        <line x1="17" y1="17" x2="20" y2="20" />
        <line x1="40" y1="40" x2="43" y2="43" />
        <line x1="43" y1="17" x2="40" y2="20" />
        <line x1="17" y1="43" x2="20" y2="40" />
      </g>
      {/* Sun Face center */}
      <circle cx="30" cy="30" r="8" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
      <circle cx="27" cy="28" r="1" fill="#78350f" />
      <circle cx="33" cy="28" r="1" fill="#78350f" />
      <path d="M28 33C29 34 31 34 32 33" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
      <defs>
        <radialGradient id="goldCoinGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <radialGradient id="goldCoinCenter" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const CopaVector: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'giant' }> = ({ size = 'md' }) => {
  const dim = size === 'giant' ? 'w-18 h-24' : size === 'lg' ? 'w-12 h-16' : size === 'sm' ? 'w-6 h-8' : 'w-8 h-11';
  return (
    <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 50 65" fill="none">
      {/* Chalice Cup */}
      <path
        d="M12 6H38C38 6 41 22 36 28C31 34 27 35 25 36C23 35 19 34 14 28C9 22 12 6 12 6Z"
        fill="url(#copaGrad)"
        stroke="#78350f"
        strokeWidth="1.5"
      />
      {/* Wine surface */}
      <ellipse cx="25" cy="10" rx="11" ry="3" fill="#991b1b" />
      {/* Gem in cup */}
      <polygon points="25,18 28,22 25,26 22,22" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8" />
      {/* Stem */}
      <rect x="23" y="36" width="4" height="15" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="25" cy="43" rx="4" ry="2" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />
      {/* Base */}
      <path d="M15 58C15 54 20 51 25 51C30 51 35 54 35 58H15Z" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1.5" />
      <defs>
        <linearGradient id="copaGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Court Figures: 10 Sota, 11 Caballo, 12 Rey
const CourtFigure: React.FC<{ value: 10 | 11 | 12; suit: Suit }> = ({ value, suit }) => {
  const figureTitle = value === 10 ? 'SOTA' : value === 11 ? 'CABALLO' : 'REY';

  return (
    <div className="flex flex-col items-center justify-center p-1 text-center">
      {/* Figure Icon */}
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center relative">
        {value === 10 && (
          <svg className="w-full h-full text-stone-800" viewBox="0 0 40 50" fill="currentColor">
            {/* Sota Page/Squire */}
            <circle cx="20" cy="10" r="6" fill="#fbcfe8" stroke="#831843" strokeWidth="1" />
            <path d="M14 8C14 4 26 4 26 8L22 4L14 8Z" fill="#b91c1c" />
            <path d="M12 18H28L25 38H15L12 18Z" fill="#1e40af" stroke="#172554" strokeWidth="1" />
            <rect x="15" y="38" width="4" height="10" fill="#78350f" />
            <rect x="21" y="38" width="4" height="10" fill="#78350f" />
          </svg>
        )}
        {value === 11 && (
          <svg className="w-full h-full text-stone-800" viewBox="0 0 50 50" fill="currentColor">
            {/* Rearing Knight on Horse */}
            <path d="M12 40C12 35 15 28 20 25C25 22 30 18 35 12C37 14 38 18 36 22L42 20C40 25 36 28 32 30L35 44H30L27 34L22 38L20 44H14L12 40Z" fill="#713f12" />
            <circle cx="26" cy="14" r="5" fill="#fbcfe8" stroke="#1e3a8a" strokeWidth="1" />
            <path d="M22 11L30 8L26 14Z" fill="#2563eb" />
          </svg>
        )}
        {value === 12 && (
          <svg className="w-full h-full text-stone-800" viewBox="0 0 50 50" fill="currentColor">
            {/* Majestic Crowned King */}
            <circle cx="25" cy="13" r="6" fill="#fbcfe8" stroke="#854d0e" strokeWidth="1" />
            {/* Crown */}
            <path d="M18 9L21 4L25 8L29 4L32 9H18Z" fill="#eab308" stroke="#713f12" strokeWidth="0.8" />
            {/* Royal Robe */}
            <path d="M14 20C14 20 20 18 25 18C30 18 36 20 36 20L34 46H16L14 20Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1" />
            <path d="M22 20H28V46H22V20Z" fill="#ffffff" stroke="#78716c" strokeWidth="0.8" strokeDasharray="1 1" />
          </svg>
        )}
      </div>

      {/* Suit Badge below court figure */}
      <div className="flex items-center gap-1 mt-0.5">
        <SuitMiniIcon suit={suit} />
        <span className="text-[9px] font-black tracking-widest text-stone-700">{figureTitle}</span>
      </div>
    </div>
  );
};

// Composition of Spanish card pips according to authentic hierarchy
const SpanishCardComposition: React.FC<{ card: Card; size: 'sm' | 'md' | 'lg' }> = ({ card, size }) => {
  const suit = card.suit;
  const val = card.value as CardValue;

  const renderSuitVector = (s: 'sm' | 'md' | 'lg' | 'giant') => {
    switch (suit) {
      case 'espada':
        return <EspadaVector size={s} />;
      case 'basto':
        return <BastoVector size={s} />;
      case 'oro':
        return <OroVector size={s} />;
      case 'copa':
        return <CopaVector size={s} />;
    }
  };

  // 10, 11, 12 Court figures
  if (val >= 10) {
    return <CourtFigure value={val as 10 | 11 | 12} suit={suit} />;
  }

  // 1 (As / Ancho): Giant central masterpiece
  if (val === 1) {
    return (
      <div className="flex items-center justify-center relative">
        {renderSuitVector('giant')}
      </div>
    );
  }

  // 2: 2 pips stacked
  if (val === 2) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1 gap-2">
        {renderSuitVector(size === 'sm' ? 'sm' : 'md')}
        {renderSuitVector(size === 'sm' ? 'sm' : 'md')}
      </div>
    );
  }

  // 3: 3 pips stacked
  if (val === 3) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1">
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
      </div>
    );
  }

  // 4: 2x2 grid
  if (val === 4) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-2 items-center justify-center p-1">
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
      </div>
    );
  }

  // 5: 4 corners + 1 center
  if (val === 5) {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {renderSuitVector('sm')}
        </div>
      </div>
    );
  }

  // 6: 2 columns of 3
  if (val === 6) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 items-center justify-center">
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
        {renderSuitVector('sm')}
      </div>
    );
  }

  // 7: 2 columns of 3 + 1 centered top/middle
  if (val === 7) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
          {renderSuitVector('sm')}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {renderSuitVector('sm')}
        </div>
      </div>
    );
  }

  return renderSuitVector('md');
};
