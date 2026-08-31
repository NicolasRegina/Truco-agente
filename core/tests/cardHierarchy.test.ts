import { describe, it, expect } from 'vitest';
import {
  createCard,
  createDeck,
  compareCards,
  getCardRank,
  SUITS,
  VALUES
} from '../src/card';

describe('Spanish Deck & Card Hierarchy', () => {
  it('creates a complete 40-card Spanish deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(40);

    for (const suit of SUITS) {
      for (const val of VALUES) {
        const found = deck.find(c => c.suit === suit && c.value === val);
        expect(found).toBeDefined();
      }
    }
  });

  it('correctly ranks the top 4 Argentine Truco cards', () => {
    const anchoEspada = createCard(1, 'espada');
    const anchoBasto = createCard(1, 'basto');
    const sieteEspada = createCard(7, 'espada');
    const sieteOro = createCard(7, 'oro');

    expect(anchoEspada.rank).toBe(14);
    expect(anchoBasto.rank).toBe(13);
    expect(sieteEspada.rank).toBe(12);
    expect(sieteOro.rank).toBe(11);

    expect(compareCards(anchoEspada, anchoBasto)).toBe(1);
    expect(compareCards(anchoBasto, sieteEspada)).toBe(1);
    expect(compareCards(sieteEspada, sieteOro)).toBe(1);
  });

  it('correctly ranks 3s and 2s above 1s falsos', () => {
    const tresCopa = createCard(3, 'copa');
    const dosOro = createCard(2, 'oro');
    const anchoOro = createCard(1, 'oro');
    const anchoCopa = createCard(1, 'copa');

    expect(tresCopa.rank).toBe(10);
    expect(dosOro.rank).toBe(9);
    expect(anchoOro.rank).toBe(8);
    expect(anchoCopa.rank).toBe(8);

    expect(compareCards(tresCopa, dosOro)).toBe(1);
    expect(compareCards(dosOro, anchoOro)).toBe(1);
    expect(compareCards(anchoOro, anchoCopa)).toBe(0); // Parda between 1 falsos
  });

  it('correctly ranks figures (12 > 11 > 10) and false 7s', () => {
    const rey = createCard(12, 'espada');
    const caballo = createCard(11, 'basto');
    const sota = createCard(10, 'oro');
    const sieteBasto = createCard(7, 'basto');
    const sieteCopa = createCard(7, 'copa');

    expect(rey.rank).toBe(7);
    expect(caballo.rank).toBe(6);
    expect(sota.rank).toBe(5);
    expect(sieteBasto.rank).toBe(4);
    expect(sieteCopa.rank).toBe(4);

    expect(compareCards(rey, caballo)).toBe(1);
    expect(compareCards(caballo, sota)).toBe(1);
    expect(compareCards(sota, sieteBasto)).toBe(1);
    expect(compareCards(sieteBasto, sieteCopa)).toBe(0); // Parda
  });

  it('correctly ranks lowest cards: 6 > 5 > 4', () => {
    const seis = createCard(6, 'copa');
    const cinco = createCard(5, 'espada');
    const cuatro = createCard(4, 'oro');

    expect(seis.rank).toBe(3);
    expect(cinco.rank).toBe(2);
    expect(cuatro.rank).toBe(1);

    expect(compareCards(seis, cinco)).toBe(1);
    expect(compareCards(cinco, cuatro)).toBe(1);
  });
});
