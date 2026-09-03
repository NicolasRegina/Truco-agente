import React, { useState } from 'react';
import { Card } from '@truco/core';
import { CardView } from './CardView';
import { ThemeId } from '../themes/types';

interface FanHandProps {
  cards: Card[];
  isMyTurn: boolean;
  canPlay: boolean;
  onPlayCard: (card: Card) => void;
  coveredMode: boolean;
  themeId: ThemeId;
}

export const FanHand: React.FC<FanHandProps> = ({
  cards,
  isMyTurn,
  canPlay,
  onPlayCard,
  coveredMode,
  themeId
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
      return { rotate: angles[index] || 0, translateY: transY[index] || 0, translateX: (index - 0.5) * 16 };
    }
    // 3 cards (Standard full hand)
    const angles = [-10, 0, 10];
    const transY = [6, 0, 6];
    const transX = [-18, 0, 18];
    return {
      rotate: angles[index] ?? 0,
      translateY: transY[index] ?? 0,
      translateX: transX[index] ?? 0
    };
  };

  return (
    <div className="relative flex items-center justify-center -space-x-4 sm:-space-x-6 py-2 px-4 perspective-[1000px] select-none">
      {cards.map((card, idx) => {
        const playable = isMyTurn && canPlay;
        const isHovered = hoveredIdx === idx;
        const geom = getCardTransform(idx, cards.length);

        return (
          <div
            key={card.id}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="transition-all duration-200 ease-out"
            style={{
              transform: isHovered
                ? `translate(${geom.translateX}px, -24px) scale(1.12) rotate(0deg)`
                : `translate(${geom.translateX}px, ${geom.translateY}px) rotate(${geom.rotate}deg)`,
              zIndex: isHovered ? 30 : idx + 10
            }}
          >
            <CardView
              card={card}
              isPlayable={playable}
              onClick={() => onPlayCard(card)}
              size="md"
              selected={coveredMode}
              themeId={themeId}
              className={isHovered ? 'shadow-2xl' : 'shadow-lg'}
            />
          </div>
        );
      })}
    </div>
  );
};
