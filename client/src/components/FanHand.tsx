import React, { useState } from 'react';
import { Card } from '@truco/core';
import { CardView } from './CardView';
import { ThemeId } from '../themes/types';
import { Sparkles } from 'lucide-react';

interface FanHandProps {
  cards: Card[];
  isMyTurn: boolean;
  canPlay: boolean;
  onPlayCard: (card: Card) => void;
  coveredMode: boolean;
  themeId: ThemeId;
  recommendedCardId?: string | null;
}

export const FanHand: React.FC<FanHandProps> = ({
  cards,
  isMyTurn,
  canPlay,
  onPlayCard,
  coveredMode,
  themeId,
  recommendedCardId
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Ergonomic hand fan geometry offsets based on number of cards
  const getCardTransform = (index: number, total: number) => {
    if (total === 1) {
      return { rotate: 0, translateY: 0, translateX: 0 };
    }
    if (total === 2) {
      const angles = [-6, 6];
      const transY = [2, 2];
      return { rotate: angles[index] || 0, translateY: transY[index] || 0, translateX: (index - 0.5) * 14 };
    }
    // 3 cards (Standard full hand)
    const angles = [-9, 0, 9];
    const transY = [4, 0, 4];
    const transX = [-16, 0, 16];
    return {
      rotate: angles[index] ?? 0,
      translateY: transY[index] ?? 0,
      translateX: transX[index] ?? 0
    };
  };

  return (
    <div className="relative flex items-center justify-center -space-x-3 sm:-space-x-5 py-1 px-2 perspective-[1000px] select-none">
      {cards.map((card, idx) => {
        const playable = isMyTurn && canPlay;
        const isHovered = hoveredIdx === idx;
        const isRecommended = card.id === recommendedCardId;
        const geom = getCardTransform(idx, cards.length);

        return (
          <div
            key={card.id}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="transition-all duration-200 ease-out relative transform-gpu will-change-transform"
            style={{
              transform: isHovered
                ? `translate(${geom.translateX}px, -20px) scale(1.1) rotate(0deg)`
                : isRecommended
                ? `translate(${geom.translateX}px, ${geom.translateY - 8}px) scale(1.04) rotate(${geom.rotate}deg)`
                : `translate(${geom.translateX}px, ${geom.translateY}px) rotate(${geom.rotate}deg)`,
              zIndex: isHovered ? 30 : isRecommended ? 25 : idx + 10,
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Coach Sparkle Tag on Recommended Card */}
            {isRecommended && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-lg flex items-center gap-0.5 whitespace-nowrap animate-bounce border border-amber-600">
                <Sparkles className="w-2.5 h-2.5 fill-current" />
                <span>Jugar</span>
              </div>
            )}

            <CardView
              card={card}
              isPlayable={playable}
              onClick={() => onPlayCard(card)}
              size="md"
              selected={coveredMode}
              themeId={themeId}
              className={`
                ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
                ${isRecommended ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.9)]' : ''}
              `}
            />
          </div>
        );
      })}
    </div>
  );
};
