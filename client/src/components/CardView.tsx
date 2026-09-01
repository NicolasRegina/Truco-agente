import React from 'react';
import { Card, CardValue } from '@truco/core';
import { ThemeId } from '../themes/types';
import { getTheme } from '../themes/themeRegistry';

interface CardViewProps {
  card?: Card;
  isFlipped?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  selected?: boolean;
  themeId?: ThemeId;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFlipped = false,
  isPlayable = false,
  onClick,
  size = 'md',
  className = '',
  selected = false,
  themeId = 'gaucho'
}) => {
  const currentTheme = getTheme(themeId);

  const sizeClasses = {
    sm: 'w-16 h-24 text-xs rounded-md',
    md: 'w-24 h-36 sm:w-28 sm:h-40 text-sm rounded-lg',
    lg: 'w-32 h-48 sm:w-36 sm:h-52 text-base rounded-xl'
  }[size];

  // Render card back (flipped, hidden or covered/tapada)
  if (isFlipped || !card || card.id === 'hidden_card' || card.isCovered) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br ${currentTheme.cardBack.bgClass} border-2 border-amber-400/70 shadow-card flex items-center justify-center p-1 relative overflow-hidden transition-all duration-200 ${className}`}
      >
        {currentTheme.cardBack.pattern}
        {card?.isCovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-[8px] font-black text-amber-300 bg-black/90 px-2 py-0.5 rounded border border-amber-500/80 uppercase tracking-wider">
              Tapada
            </span>
          </div>
        )}
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
    ? currentTheme.trumpBadges.anchoEspada
    : isHembra
    ? currentTheme.trumpBadges.anchoBasto
    : isSieteEspada
    ? currentTheme.trumpBadges.sieteEspada
    : isSieteOro
    ? currentTheme.trumpBadges.sieteOro
    : null;

  const suitDef = currentTheme.suits[card.suit];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        ${sizeClasses}
        bg-gradient-to-b ${currentTheme.colors.cardBg}
        ${currentTheme.colors.cardText}
        border-2 ${isTopTrump ? 'border-amber-400 ring-1 ring-amber-400' : currentTheme.colors.cardBorder}
        ${isTopTrump ? (isMacho ? 'card-macho' : isHembra ? 'card-hembra' : 'card-siete-oro') : 'shadow-card'}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-card-hover active:scale-95 transition-transform' : ''}
        ${selected ? '-translate-y-4 ring-4 ring-amber-400' : ''}
        flex flex-col justify-between p-1.5 sm:p-2 relative select-none transition-all duration-200
        ${className}
      `}
    >
      {/* Corner indexing (Top Left) */}
      <div className="flex items-center justify-between leading-none z-10">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-black font-sans leading-none">{card.value}</span>
          <div className="mt-0.5">{suitDef.mini}</div>
        </div>
        {trumpBadge && (
          <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 uppercase tracking-tighter shadow-sm border border-amber-600/50">
            {trumpBadge}
          </span>
        )}
      </div>

      {/* Center thematic illustration */}
      <div className="flex-1 flex items-center justify-center my-0.5 z-10 w-full overflow-hidden">
        <ThemeCardComposition card={card} size={size} themeId={themeId} />
      </div>

      {/* Corner indexing (Bottom Right - Inverted) */}
      <div className="flex items-center justify-between rotate-180 leading-none z-10">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-black font-sans leading-none">{card.value}</span>
          <div className="mt-0.5">{suitDef.mini}</div>
        </div>
      </div>
    </div>
  );
};

// Composition rendering for any theme
const ThemeCardComposition: React.FC<{ card: Card; size: 'sm' | 'md' | 'lg'; themeId: ThemeId }> = ({
  card,
  size,
  themeId
}) => {
  const theme = getTheme(themeId);
  const suitDef = theme.suits[card.suit];
  const val = card.value as CardValue;

  // 10, 11, 12 Court figures from theme
  if (val >= 10) {
    const fig = theme.figures[val as 10 | 11 | 12];
    return (
      <div className="flex flex-col items-center justify-center p-0.5 text-center">
        {fig.render(card.suit)}
        <span className="text-[8px] sm:text-[9px] font-black tracking-widest mt-0.5 uppercase opacity-90">
          {fig.name}
        </span>
      </div>
    );
  }

  // 1: Giant central masterpiece
  if (val === 1) {
    return (
      <div className="flex items-center justify-center relative">
        {suitDef.render('giant')}
      </div>
    );
  }

  // 2: 2 pips stacked
  if (val === 2) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1 gap-2">
        {suitDef.render(size === 'sm' ? 'sm' : 'md')}
        {suitDef.render(size === 'sm' ? 'sm' : 'md')}
      </div>
    );
  }

  // 3: 3 pips stacked
  if (val === 3) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1">
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
      </div>
    );
  }

  // 4: 2x2 grid
  if (val === 4) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-2 items-center justify-center p-1">
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
      </div>
    );
  }

  // 5: 4 corners + 1 center
  if (val === 5) {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
          {suitDef.render('sm')}
          {suitDef.render('sm')}
          {suitDef.render('sm')}
          {suitDef.render('sm')}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {suitDef.render('sm')}
        </div>
      </div>
    );
  }

  // 6: 2 columns of 3
  if (val === 6) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 items-center justify-center">
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
        {suitDef.render('sm')}
      </div>
    );
  }

  // 7: 2 columns of 3 + 1 centered
  if (val === 7) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {suitDef.render('sm')}
          {suitDef.render('sm')}
          {suitDef.render('sm')}
          {suitDef.render('sm')}
          {suitDef.render('sm')}
          {suitDef.render('sm')}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {suitDef.render('sm')}
        </div>
      </div>
    );
  }

  return <div>{suitDef.render('md')}</div>;
};
