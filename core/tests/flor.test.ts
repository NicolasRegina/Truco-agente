import { describe, it, expect } from 'vitest';
import { createCard } from '../src/card';
import { calculateFlorValue, compareFlor, hasFlor } from '../src/flor';

describe('Flor Engine', () => {
  it('detects Flor when all 3 cards share the same suit', () => {
    const florHand = [
      createCard(7, 'espada'),
      createCard(6, 'espada'),
      createCard(1, 'espada')
    ];
    const nonFlorHand = [
      createCard(7, 'espada'),
      createCard(6, 'espada'),
      createCard(1, 'oro')
    ];

    expect(hasFlor(florHand)).toBe(true);
    expect(hasFlor(nonFlorHand)).toBe(false);
  });

  it('calculates Flor value: sum of cards + 20', () => {
    const florHand = [
      createCard(7, 'espada'),
      createCard(6, 'espada'),
      createCard(5, 'espada')
    ];
    // 7 + 6 + 5 + 20 = 38
    expect(calculateFlorValue(florHand)).toBe(38);
  });

  it('breaks Flor ties using Mano priority', () => {
    const florP1 = [createCard(7, 'espada'), createCard(6, 'espada'), createCard(1, 'espada')]; // 34
    const florP2 = [createCard(7, 'oro'), createCard(6, 'oro'), createCard(1, 'oro')]; // 34

    const res = compareFlor(florP1, florP2, 'p2');
    expect(res.winner).toBe('p2');
  });
});
