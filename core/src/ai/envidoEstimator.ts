import { Card } from '../types';
import { calculateEnvido } from '../envido';
import { createDeck } from '../card';

export interface EnvidoOdds {
  myValue: number;
  winProbability: number; // 0 to 1
  tieProbability: number;
  lossProbability: number;
}

export function estimateEnvidoOdds(
  myCards: Card[],
  playedCards: Card[] = [],
  isMano: boolean = false
): EnvidoOdds {
  const myValue = calculateEnvido(myCards);
  const knownCards = new Set([...myCards, ...playedCards].map(c => c.id));
  const remainingDeck = createDeck().filter(c => !knownCards.has(c.id));

  // Fast Monte Carlo sampling (500 random opponent 3-card hands)
  const SAMPLES = 500;
  let wins = 0;
  let ties = 0;
  let losses = 0;

  for (let s = 0; s < SAMPLES; s++) {
    // Pick 3 random distinct cards from remaining deck
    const idx1 = Math.floor(Math.random() * remainingDeck.length);
    let idx2 = Math.floor(Math.random() * remainingDeck.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * remainingDeck.length);
    let idx3 = Math.floor(Math.random() * remainingDeck.length);
    while (idx3 === idx1 || idx3 === idx2) idx3 = Math.floor(Math.random() * remainingDeck.length);

    const opponentCards = [remainingDeck[idx1], remainingDeck[idx2], remainingDeck[idx3]];
    const oppValue = calculateEnvido(opponentCards);

    if (myValue > oppValue) {
      wins++;
    } else if (myValue < oppValue) {
      losses++;
    } else {
      // Tie
      ties++;
      if (isMano) {
        wins++;
      } else {
        losses++;
      }
    }
  }

  return {
    myValue,
    winProbability: wins / SAMPLES,
    tieProbability: ties / SAMPLES,
    lossProbability: losses / SAMPLES
  };
}
