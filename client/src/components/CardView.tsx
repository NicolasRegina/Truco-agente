import React from 'react';
import { Card, CardValue } from '@truco/core';
import { ThemeId } from '../themes/types';
import { getTheme } from '../themes/themeRegistry';
import { SpanishCardRenderer } from './SpanishCardRenderer';
import { profileService } from '../services/profileService';

interface CardViewProps {
  card?: Card;
  isFlipped?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  selected?: boolean;
  themeId?: ThemeId;
  cardBackId?: string;
}

// Registry of available illustrated card images by theme
const ALL_SPANISH_CARDS = [
  'basto_1', 'basto_2', 'basto_3', 'basto_4', 'basto_5', 'basto_6', 'basto_7', 'basto_10', 'basto_11', 'basto_12',
  'copa_1', 'copa_2', 'copa_3', 'copa_4', 'copa_5', 'copa_6', 'copa_7', 'copa_10', 'copa_11', 'copa_12',
  'espada_1', 'espada_2', 'espada_3', 'espada_4', 'espada_5', 'espada_6', 'espada_7', 'espada_10', 'espada_11', 'espada_12',
  'oro_1', 'oro_2', 'oro_3', 'oro_4', 'oro_5', 'oro_6', 'oro_7', 'oro_10', 'oro_11', 'oro_12'
];

const THEME_CARD_IMAGES: Record<string, string[]> = {
  gaucho: ALL_SPANISH_CARDS
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFlipped = false,
  isPlayable = false,
  onClick,
  size = 'md',
  className = '',
  selected = false,
  themeId = 'gaucho',
  cardBackId
}) => {
  const currentTheme = getTheme(themeId);
  const equippedBack = cardBackId || profileService.getCached()?.equippedCardBack || 'clasico';
  const cardBackSrc = `/card_backs/card_${equippedBack}.jpg`;

  const sizeClasses = {
    sm: 'w-14 h-21 sm:w-16 sm:h-24 text-[10px] sm:text-xs rounded-md',
    md: 'w-[86px] h-[129px] sm:w-28 sm:h-40 text-xs sm:text-sm rounded-lg',
    lg: 'w-28 h-42 sm:w-36 sm:h-52 text-sm sm:text-base rounded-xl'
  }[size];

  // Render card back (flipped, hidden or covered/tapada)
  if (isFlipped || !card || card.id === 'hidden_card' || card.id.startsWith('hidden') || card.isCovered) {
    return (
      <div
        className={`${sizeClasses} rounded-lg sm:rounded-xl overflow-hidden border-2 border-amber-500/80 shadow-card flex items-center justify-center relative select-none transition-all duration-200 bg-stone-900 ${className}`}
      >
        <img
          src={cardBackSrc}
          onError={(e) => {
            // Fallback to default classic card back
            (e.target as HTMLImageElement).src = '/card_backs/card_clasico.jpg';
          }}
          alt="Dorso de Carta"
          className="w-full h-full object-cover scale-[1.02] card-img-crisp pointer-events-none select-none"
        />
        {card?.isCovered && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
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

  // Check if this card has an image in the theme folder: /themes/<themeId>/cards/<suit>_<val>.jpg
  const cardKey = `${card.suit}_${card.value}`;
  const hasThemedImage = THEME_CARD_IMAGES[themeId]?.includes(cardKey);

  if (hasThemedImage) {
    const imagePath = `/themes/${themeId}/cards/${cardKey}.jpg`;

    return (
      <div
        onClick={isPlayable ? onClick : undefined}
        className={`
          ${sizeClasses}
          rounded-lg sm:rounded-xl overflow-hidden border-2 transform-gpu
          ${isTopTrump ? 'border-amber-400 ring-2 ring-amber-400 shadow-2xl' : 'border-stone-800 shadow-card'}
          ${isTopTrump ? (isMacho ? 'card-macho' : isHembra ? 'card-hembra' : 'card-siete-oro') : ''}
          ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-card-hover active:scale-95 transition-transform' : ''}
          ${selected ? '-translate-y-4 ring-4 ring-amber-400' : ''}
          relative select-none transition-all duration-200 bg-[#f5ede0]
          ${className}
        `}
      >
        <img
          src={imagePath}
          alt={`${card.value} de ${card.suit}`}
          className="w-full h-full object-cover scale-[1.07] card-img-crisp pointer-events-none select-none"
        />
        {/* Trump Badge overlay */}
        {trumpBadge && (
          <div className="absolute top-1 right-1 z-20">
            <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 uppercase tracking-tighter shadow-md border border-amber-600">
              {trumpBadge}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback for Gaucho theme if specific card image is not yet generated (e.g. 3, 4, 5, 6)
  if (themeId === 'gaucho') {
    return (
      <div
        onClick={isPlayable ? onClick : undefined}
        className={`
          ${sizeClasses}
          ${isTopTrump ? (isMacho ? 'card-macho ring-2 ring-sky-400' : isHembra ? 'card-hembra ring-2 ring-emerald-400' : 'card-siete-oro ring-2 ring-amber-400') : ''}
          ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-card-hover active:scale-95 transition-transform' : ''}
          ${selected ? '-translate-y-4 ring-4 ring-amber-400' : ''}
          transition-all duration-200
          ${className}
        `}
      >
        <SpanishCardRenderer
          card={card}
          size={size}
          trumpBadge={trumpBadge}
        />
      </div>
    );
  }

  // For other themes (Scaloneta, Pixel, Noxus), render their custom vector theme engine
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
          <span className="text-sm sm:text-base font-black font-serif leading-none">{card.value}</span>
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
          <span className="text-sm sm:text-base font-black font-serif leading-none">{card.value}</span>
          <div className="mt-0.5">{suitDef.mini}</div>
        </div>
      </div>
    </div>
  );
};

// Composition rendering for other themes
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
