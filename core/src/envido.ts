import { Card, EnvidoCallType, PlayerId, ScoreState, Suit } from './types';

export function calculateEnvido(cards: Card[]): number {
  if (!cards || cards.length === 0) return 0;
  if (cards.length === 1) return cards[0].envidoValue;

  const suitsMap: Partial<Record<Suit, Card[]>> = {};
  for (const card of cards) {
    if (!suitsMap[card.suit]) {
      suitsMap[card.suit] = [];
    }
    suitsMap[card.suit]!.push(card);
  }

  let maxEnvido = 0;

  // Single card maximum (when all suits are distinct)
  for (const card of cards) {
    if (card.envidoValue > maxEnvido) {
      maxEnvido = card.envidoValue;
    }
  }

  // Same suit combinations (2 or 3 cards)
  for (const suit in suitsMap) {
    const suitCards = suitsMap[suit as Suit]!;
    if (suitCards.length >= 2) {
      // Find maximum pair in this suit
      for (let i = 0; i < suitCards.length; i++) {
        for (let j = i + 1; j < suitCards.length; j++) {
          const comboVal = 20 + suitCards[i].envidoValue + suitCards[j].envidoValue;
          if (comboVal > maxEnvido) {
            maxEnvido = comboVal;
          }
        }
      }
    }
  }

  return maxEnvido;
}

export function calculateFaltaEnvidoPoints(
  score: ScoreState,
  maxScore: 15 | 30
): number {
  const halfway = maxScore === 30 ? 15 : 7;
  const p1 = score.p1;
  const p2 = score.p2;
  const inBuenas = p1 > halfway || p2 > halfway;

  if (inBuenas) {
    // In Buenas: whoever wins Falta Envido gets the points needed for the leader to win the game (wins the match)
    const leaderScore = Math.max(p1, p2);
    return Math.max(1, maxScore - leaderScore);
  } else {
    // In Malas: points needed for the leader to win the whole match (or match target - leader score)
    const leaderScore = Math.max(p1, p2);
    return Math.max(1, maxScore - leaderScore);
  }
}

export interface EnvidoBetOutcome {
  acceptedPoints: number;
  declinedPoints: number;
}

export function getEnvidoStakes(
  history: EnvidoCallType[],
  score: ScoreState,
  maxScore: 15 | 30
): EnvidoBetOutcome {
  if (history.length === 0) {
    return { acceptedPoints: 0, declinedPoints: 0 };
  }

  const lastCall = history[history.length - 1];
  const faltaPoints = calculateFaltaEnvidoPoints(score, maxScore);

  // Exact chain resolution
  // Base single calls
  if (history.length === 1) {
    if (lastCall === 'envido') return { acceptedPoints: 2, declinedPoints: 1 };
    if (lastCall === 'real_envido') return { acceptedPoints: 3, declinedPoints: 1 };
    if (lastCall === 'falta_envido') return { acceptedPoints: faltaPoints, declinedPoints: 1 };
  }

  // Calculate accumulated declined points (sum of previous stakes)
  let prevAccumulated = 0;
  for (let i = 0; i < history.length - 1; i++) {
    const call = history[i];
    if (call === 'envido') prevAccumulated += 2;
    else if (call === 'real_envido') prevAccumulated += 3;
  }
  if (prevAccumulated === 0) prevAccumulated = 1;

  if (lastCall === 'falta_envido') {
    return {
      acceptedPoints: faltaPoints,
      declinedPoints: prevAccumulated
    };
  }

  // Chain calculation for standard calls
  let totalAccepted = 0;
  for (const call of history) {
    if (call === 'envido') totalAccepted += 2;
    else if (call === 'real_envido') totalAccepted += 3;
  }

  return {
    acceptedPoints: totalAccepted,
    declinedPoints: prevAccumulated
  };
}

export function compareEnvido(
  p1Cards: Card[],
  p2Cards: Card[],
  mano: PlayerId
): { winner: PlayerId; p1Points: number; p2Points: number } {
  const p1Val = calculateEnvido(p1Cards);
  const p2Val = calculateEnvido(p2Cards);

  if (p1Val > p2Val) {
    return { winner: 'p1', p1Points: p1Val, p2Points: p2Val };
  } else if (p2Val > p1Val) {
    return { winner: 'p2', p1Points: p1Val, p2Points: p2Val };
  } else {
    // Tie is won by Mano
    return { winner: mano, p1Points: p1Val, p2Points: p2Val };
  }
}
