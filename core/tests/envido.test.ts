import { describe, it, expect } from 'vitest';
import { createCard } from '../src/card';
import {
  calculateEnvido,
  calculateFaltaEnvidoPoints,
  compareEnvido,
  getEnvidoStakes
} from '../src/envido';

describe('Envido & Falta Envido Engine', () => {
  it('calculates maximum 33 envido for 7 and 6 of same suit', () => {
    const cards = [
      createCard(7, 'espada'),
      createCard(6, 'espada'),
      createCard(1, 'basto')
    ];
    expect(calculateEnvido(cards)).toBe(33);
  });

  it('calculates 20 envido for two face cards (figures) of same suit', () => {
    const cards = [
      createCard(12, 'oro'),
      createCard(10, 'oro'),
      createCard(4, 'copa')
    ];
    expect(calculateEnvido(cards)).toBe(20);
  });

  it('calculates highest single card when all suits are distinct', () => {
    const cards = [
      createCard(7, 'copa'),
      createCard(6, 'espada'),
      createCard(1, 'basto')
    ];
    expect(calculateEnvido(cards)).toBe(7);
  });

  it('calculates 0 if all cards are figures with different suits', () => {
    const cards = [
      createCard(10, 'copa'),
      createCard(11, 'espada'),
      createCard(12, 'basto')
    ];
    expect(calculateEnvido(cards)).toBe(0);
  });

  it('correctly calculates Falta Envido in Malas vs Buenas', () => {
    // 30-point match, Malas (e.g. 10 to 8)
    const malasScore = { p1: 10, p2: 8 };
    // Points needed for leader (10) to reach 30 = 20 pts
    expect(calculateFaltaEnvidoPoints(malasScore, 30)).toBe(20);

    // 30-point match, Buenas (e.g. 24 to 18)
    const buenasScore = { p1: 24, p2: 18 };
    // Points needed for leader (24) to reach 30 = 6 pts
    expect(calculateFaltaEnvidoPoints(buenasScore, 30)).toBe(6);
  });

  it('determines Envido winner and breaks ties with Mano', () => {
    const p1Cards = [createCard(7, 'espada'), createCard(5, 'espada'), createCard(1, 'oro')]; // 32
    const p2Cards = [createCard(6, 'copa'), createCard(5, 'copa'), createCard(1, 'basto')]; // 31

    const res1 = compareEnvido(p1Cards, p2Cards, 'p1');
    expect(res1.winner).toBe('p1');
    expect(res1.p1Points).toBe(32);
    expect(res1.p2Points).toBe(31);

    // Tie (32 vs 32)
    const p2CardsTie = [createCard(7, 'copa'), createCard(5, 'copa'), createCard(1, 'basto')]; // 32
    const resTieP1Mano = compareEnvido(p1Cards, p2CardsTie, 'p1');
    expect(resTieP1Mano.winner).toBe('p1');

    const resTieP2Mano = compareEnvido(p1Cards, p2CardsTie, 'p2');
    expect(resTieP2Mano.winner).toBe('p2');
  });

  it('correctly calculates Envido stake escalations', () => {
    const score = { p1: 5, p2: 5 };

    // Direct Envido
    const s1 = getEnvidoStakes(['envido'], score, 30);
    expect(s1.acceptedPoints).toBe(2);
    expect(s1.declinedPoints).toBe(1);

    // Envido -> Envido
    const s2 = getEnvidoStakes(['envido', 'envido'], score, 30);
    expect(s2.acceptedPoints).toBe(4);
    expect(s2.declinedPoints).toBe(2);

    // Envido -> Real Envido
    const s3 = getEnvidoStakes(['envido', 'real_envido'], score, 30);
    expect(s3.acceptedPoints).toBe(5);
    expect(s3.declinedPoints).toBe(2);

    // Envido -> Envido -> Real Envido
    const s4 = getEnvidoStakes(['envido', 'envido', 'real_envido'], score, 30);
    expect(s4.acceptedPoints).toBe(7);
    expect(s4.declinedPoints).toBe(4);
  });
});
