import React from 'react';
import { Card, Suit } from '@truco/core';

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
        className={`${sizeClasses} bg-gradient-to-br from-red-800 via-red-900 to-amber-950 border-2 border-amber-400/60 shadow-card flex items-center justify-center p-1 relative overflow-hidden transition-all duration-200 ${className}`}
      >
        {/* Intricate Argentine deck pattern */}
        <div className="w-full h-full border border-amber-300/40 rounded flex flex-col items-center justify-center bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] gap-1">
          <div className="w-8 h-8 rounded-full border border-amber-300/60 flex items-center justify-center bg-red-950/80 shadow-inner">
            <span className="text-amber-300 font-bold text-[10px]">T</span>
          </div>
          {card?.isCovered && (
            <span className="text-[8px] font-extrabold text-amber-300 bg-black/60 px-1 rounded uppercase tracking-tighter">
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
    ? 'Ancho Espada'
    : isHembra
    ? 'Ancho Basto'
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
        bg-gradient-to-b from-amber-50 to-amber-100/90
        text-slate-900 font-bold
        border-2 ${isTopTrump ? 'border-amber-500' : 'border-slate-300'}
        ${isTopTrump ? (isMacho ? 'card-macho' : isHembra ? 'card-hembra' : 'card-siete-oro') : 'shadow-card'}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-card-hover active:scale-95 transition-transform' : ''}
        ${selected ? '-translate-y-4 ring-4 ring-amber-400' : ''}
        flex flex-col justify-between p-1.5 sm:p-2 relative select-none transition-all duration-200
        ${className}
      `}
    >
      {/* Top Left corner */}
      <div className="flex items-center justify-between leading-none">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-extrabold">{card.value}</span>
          <SuitIcon suit={card.suit} size="sm" />
        </div>
        {trumpBadge && (
          <span className="text-[9px] font-extrabold px-1 py-0.5 rounded bg-amber-400/90 text-amber-950 uppercase tracking-tighter">
            {trumpBadge}
          </span>
        )}
      </div>

      {/* Center artwork */}
      <div className="flex-1 flex items-center justify-center my-0.5">
        <CenterIllustration card={card} />
      </div>

      {/* Bottom Right corner (inverted) */}
      <div className="flex items-center justify-between rotate-180 leading-none">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-extrabold">{card.value}</span>
          <SuitIcon suit={card.suit} size="sm" />
        </div>
      </div>
    </div>
  );
};

const SuitIcon: React.FC<{ suit: Suit; size?: 'sm' | 'md' | 'lg' }> = ({ suit, size = 'md' }) => {
  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  }[size];

  switch (suit) {
    case 'espada':
      return (
        <svg className={`${iconSize} text-blue-700`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 8L13 9L13 18L15 19L15 21L12 20L9 21L9 19L11 18L11 9L9 8L12 2Z" />
        </svg>
      );
    case 'basto':
      return (
        <svg className={`${iconSize} text-emerald-800`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10 2 9 4 10 7C9 9 7 11 8 14C9 17 10 19 11 22H13C14 19 15 17 16 14C17 11 15 9 14 7C15 4 14 2 12 2Z" />
        </svg>
      );
    case 'oro':
      return (
        <svg className={`${iconSize} text-amber-500`} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="6" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
          <path d="M12 8V16M8 12H16" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'copa':
      return (
        <svg className={`${iconSize} text-red-600`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 3H17V8C17 11.3 14.3 14 11 14H13C9.7 14 7 11.3 7 8V3ZM11 14V19H8V21H16V19H13V14" />
        </svg>
      );
  }
};

const CenterIllustration: React.FC<{ card: Card }> = ({ card }) => {
  // Center rendering with suit count or special figure
  if (card.value >= 10) {
    const figureName = card.value === 10 ? 'Sota' : card.value === 11 ? 'Caballo' : 'Rey';
    return (
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <SuitIcon suit={card.suit} size="md" />
        <span className="text-[10px] sm:text-xs font-bold text-slate-700 mt-1">{figureName}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <SuitIcon suit={card.suit} size="lg" />
    </div>
  );
};
