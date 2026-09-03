import { Card, FlorCallType, PlayerId, ScoreState } from './types';
import { calculateFaltaEnvidoPoints } from './envido';

export function hasFlor(cards: Card[]): boolean {
  if (!cards || cards.length < 3) return false;
  const s0 = cards[0]?.suit?.toString()?.toLowerCase()?.trim();
  const s1 = cards[1]?.suit?.toString()?.toLowerCase()?.trim();
  const s2 = cards[2]?.suit?.toString()?.toLowerCase()?.trim();
  return Boolean(s0 && s0 === s1 && s1 === s2 && ['espada', 'basto', 'oro', 'copa'].includes(s0));
}

export function calculateFlorValue(cards: Card[]): number {
  if (!hasFlor(cards)) return 0;
  // Official Argentine Truco rule:
  // "Los puntos de la Flor se cuentan de la misma manera que los tantos del Envido, sumando el valor de las dos cartas más altas."
  const values = cards
    .map(c => (typeof c.envidoValue === 'number' ? c.envidoValue : (c.value >= 10 ? 0 : c.value)))
    .sort((a, b) => b - a);
  return 20 + values[0] + values[1];
}

export interface FlorBetOutcome {
  acceptedPoints: number;
  declinedPoints: number;
}

export function getFlorStakes(
  history: FlorCallType[],
  score: ScoreState,
  maxScore: 15 | 30
): FlorBetOutcome {
  if (history.length === 0) {
    return { acceptedPoints: 3, declinedPoints: 0 };
  }

  const lastCall = history[history.length - 1];
  const restoPoints = calculateFaltaEnvidoPoints(score, maxScore);

  if (lastCall === 'contraflor_al_resto') {
    return { acceptedPoints: restoPoints, declinedPoints: 4 };
  }

  if (lastCall === 'contraflor') {
    return { acceptedPoints: 6, declinedPoints: 3 };
  }

  return { acceptedPoints: 3, declinedPoints: 0 };
}

export function compareFlor(
  p1Cards: Card[],
  p2Cards: Card[],
  mano: PlayerId
): { winner: PlayerId; p1Points: number; p2Points: number } {
  const p1Val = calculateFlorValue(p1Cards);
  const p2Val = calculateFlorValue(p2Cards);

  if (p1Val > p2Val) {
    return { winner: 'p1', p1Points: p1Val, p2Points: p2Val };
  } else if (p2Val > p1Val) {
    return { winner: 'p2', p1Points: p1Val, p2Points: p2Val };
  } else {
    return { winner: mano, p1Points: p1Val, p2Points: p2Val };
  }
}
