import { Card, FlorCallType, PlayerId, ScoreState } from './types';
import { calculateFaltaEnvidoPoints } from './envido';

export function hasFlor(cards: Card[]): boolean {
  if (!cards || cards.length < 3) return false;
  return cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
}

export function calculateFlorValue(cards: Card[]): number {
  if (!hasFlor(cards)) return 0;
  return 20 + cards[0].envidoValue + cards[1].envidoValue + cards[2].envidoValue;
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
