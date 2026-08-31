import { Card, CardValue, Suit } from './types';

export const SUITS: Suit[] = ['espada', 'basto', 'oro', 'copa'];
export const VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export function getCardRank(value: CardValue, suit: Suit): number {
  if (value === 1 && suit === 'espada') return 14; // 1 de Espada (Macho)
  if (value === 1 && suit === 'basto') return 13;  // 1 de Basto (Hembra)
  if (value === 7 && suit === 'espada') return 12; // 7 de Espada
  if (value === 7 && suit === 'oro') return 11;    // 7 de Oro
  if (value === 3) return 10;                     // Todos los 3
  if (value === 2) return 9;                      // Todos los 2
  if (value === 1 && (suit === 'oro' || suit === 'copa')) return 8; // 1 falsos
  if (value === 12) return 7;                     // Todos los 12 (Reyes)
  if (value === 11) return 6;                     // Todos los 11 (Caballos)
  if (value === 10) return 5;                     // Todos los 10 (Sotas)
  if (value === 7 && (suit === 'basto' || suit === 'copa')) return 4; // 7 falsos
  if (value === 6) return 3;                      // Todos los 6
  if (value === 5) return 2;                      // Todos los 5
  if (value === 4) return 1;                      // Todos los 4
  return 0;
}

export function getEnvidoValue(value: CardValue): number {
  if (value >= 10) return 0;
  return value;
}

export function createCard(value: CardValue, suit: Suit, isCovered: boolean = false): Card {
  return {
    id: `${value}_${suit}`,
    value,
    suit,
    rank: getCardRank(value, suit),
    envidoValue: getEnvidoValue(value),
    isCovered
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push(createCard(value, suit));
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[], randomFn: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function compareCards(cardA: Card, cardB: Card): number {
  // Carta tapada rules:
  if (cardA.isCovered && cardB.isCovered) return 0;
  if (cardA.isCovered) return -1;
  if (cardB.isCovered) return 1;

  if (cardA.rank > cardB.rank) return 1;
  if (cardA.rank < cardB.rank) return -1;
  return 0; // Parda (Tie)
}

export function formatCardName(card: Card): string {
  if (card.isCovered) {
    return 'una carta tapada';
  }

  const suitNames: Record<Suit, string> = {
    espada: 'Espada',
    basto: 'Basto',
    oro: 'Oro',
    copa: 'Copa'
  };

  if (card.value === 1 && card.suit === 'espada') return '1 de Espada (Ancho de Espada)';
  if (card.value === 1 && card.suit === 'basto') return '1 de Basto (Ancho de Basto)';
  if (card.value === 7 && card.suit === 'espada') return '7 de Espada';
  if (card.value === 7 && card.suit === 'oro') return '7 de Oro (Siete Bravo)';

  return `${card.value} de ${suitNames[card.suit]}`;
}
