import { describe, it, expect } from 'vitest';
import { createCard } from '../src/card';
import {
  applyAction,
  createInitialGameState,
  getAvailableActions,
  startNextHand
} from '../src/trucoStateMachine';

describe('Truco FSM & Parda Rules', () => {
  it('resolves a clean 2-0 hand win for P1', () => {
    // p1 cards: 1 espada (14), 1 basto (13), 7 espada (12)
    // p2 cards: 4 copa (1), 4 espada (1), 4 basto (1)
    const customDeck = () => [
      createCard(1, 'espada'), createCard(4, 'copa'),
      createCard(1, 'basto'), createCard(4, 'espada'),
      createCard(7, 'espada'), createCard(4, 'basto')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: false }, customDeck);
    expect(state.turn).toBe('p1');
    expect(state.phase).toBe('waiting_action');

    // Trick 1: P1 plays 1 espada, P2 plays 4 copa -> P1 wins trick 1
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    expect(state.turn).toBe('p2');
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });

    expect(state.tricks[0].winner).toBe('p1');
    expect(state.currentTrickIndex).toBe(1);
    expect(state.turn).toBe('p1'); // Winner of trick 1 leads trick 2

    // Trick 2: P1 plays 1 basto, P2 plays 4 espada -> P1 wins trick 2 & the hand
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });

    expect(state.tricks[1].winner).toBe('p1');
    expect(state.phase).toBe('hand_ended');
    expect(state.handWinner).toBe('p1');
    expect(state.score.p1).toBe(1); // 1 point for simple hand
  });

  it('resolves 1st trick Parda -> winner of 2nd trick wins the hand', () => {
    // Parda in trick 1 (3 oro vs 3 copa)
    // P2 wins trick 2 (1 espada vs 4 basto)
    const customDeck = () => [
      createCard(3, 'oro'), createCard(3, 'copa'),
      createCard(4, 'basto'), createCard(1, 'espada'),
      createCard(4, 'oro'), createCard(4, 'espada')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: false }, customDeck);

    // Trick 1: Parda
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[0].winner).toBe('parda');
    expect(state.turn).toBe('p1'); // Leader after parda

    // Trick 2: P1 plays 4 basto, P2 plays 1 espada
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });

    expect(state.tricks[1].winner).toBe('p2');
    expect(state.phase).toBe('hand_ended');
    expect(state.handWinner).toBe('p2');
    expect(state.score.p2).toBe(1);
  });

  it('resolves 2nd trick Parda -> winner of 1st trick wins the hand', () => {
    // P1 wins trick 1 (1 espada vs 4 basto)
    // Trick 2 is Parda (3 oro vs 3 copa) -> P1 wins hand!
    const customDeck = () => [
      createCard(1, 'espada'), createCard(4, 'basto'),
      createCard(3, 'oro'), createCard(3, 'copa'),
      createCard(4, 'oro'), createCard(4, 'espada')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: false }, customDeck);

    // Trick 1: P1 wins
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[0].winner).toBe('p1');

    // Trick 2: Parda
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });

    expect(state.tricks[1].winner).toBe('parda');
    expect(state.phase).toBe('hand_ended');
    expect(state.handWinner).toBe('p1');
    expect(state.score.p1).toBe(1);
  });

  it('resolves Win 1st, Lose 2nd, Parda 3rd -> Winner of 1st trick wins', () => {
    // T1: P1 wins
    // T2: P2 wins
    // T3: Parda (3 oro vs 3 copa) -> P1 wins because P1 won T1!
    const customDeck = () => [
      createCard(1, 'espada'), createCard(4, 'basto'),
      createCard(4, 'oro'), createCard(1, 'basto'),
      createCard(3, 'oro'), createCard(3, 'copa')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: false }, customDeck);

    // T1
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[0].winner).toBe('p1');

    // T2 (P1 leads)
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[1].winner).toBe('p2');

    // T3 (P2 leads)
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    expect(state.tricks[2].winner).toBe('parda');

    expect(state.phase).toBe('hand_ended');
    expect(state.handWinner).toBe('p1');
  });

  it('resolves Triple Parda -> Mano wins hand', () => {
    // T1: Parda (3 oro vs 3 copa)
    // T2: Parda (2 oro vs 2 copa)
    // T3: Parda (1 oro vs 1 copa) -> Mano (P1) wins!
    const customDeck = () => [
      createCard(3, 'oro'), createCard(3, 'copa'),
      createCard(2, 'oro'), createCard(2, 'copa'),
      createCard(1, 'oro'), createCard(1, 'copa')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: false }, customDeck);

    // T1
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[0].winner).toBe('parda');

    // T2
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[1].winner).toBe('parda');

    // T3
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    expect(state.tricks[2].winner).toBe('parda');

    expect(state.phase).toBe('hand_ended');
    expect(state.handWinner).toBe('p1'); // Mano is p1
  });

  it('handles Truco -> Retruco -> Vale Cuatro bet escalation and score awarding', () => {
    const customDeck = () => [
      createCard(1, 'espada'), createCard(4, 'copa'),
      createCard(1, 'basto'), createCard(4, 'espada'),
      createCard(7, 'espada'), createCard(4, 'basto')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: false }, customDeck);

    // P1 calls Truco
    state = applyAction(state, { type: 'CALL_TRUCO', player: 'p1' });
    expect(state.phase).toBe('truco_pending');
    expect(state.turn).toBe('p2');

    // P2 raises to Re-Truco
    state = applyAction(state, { type: 'CALL_RETRUCO', player: 'p2' });
    expect(state.truco.pendingLevel).toBe('retruco');
    expect(state.turn).toBe('p1');

    // P1 raises to Vale Cuatro
    state = applyAction(state, { type: 'CALL_VALE_CUATRO', player: 'p1' });
    expect(state.truco.pendingLevel).toBe('vale_cuatro');
    expect(state.turn).toBe('p2');

    // P2 accepts Vale Cuatro
    state = applyAction(state, { type: 'QUIERO', player: 'p2' });
    expect(state.phase).toBe('waiting_action');
    expect(state.truco.currentLevel).toBe('vale_cuatro');

    // P1 wins 2 tricks
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p1', card: state.hands.p1[0] });
    state = applyAction(state, { type: 'PLAY_CARD', player: 'p2', card: state.hands.p2[0] });

    expect(state.phase).toBe('hand_ended');
    expect(state.handWinner).toBe('p1');
    expect(state.score.p1).toBe(4); // 4 points from Vale Cuatro!
  });

  it('correctly alternates dealer and mano when starting next hand', () => {
    let state = createInitialGameState({ maxScore: 30, withFlor: false });
    expect(state.mano).toBe('p1');
    expect(state.dealer).toBe('p2');

    // Fold hand
    state = applyAction(state, { type: 'IRSE_AL_MAZO', player: 'p1' });
    expect(state.phase).toBe('hand_ended');

    // Next hand
    state = startNextHand(state);
    expect(state.handNumber).toBe(2);
    expect(state.mano).toBe('p2');
    expect(state.dealer).toBe('p1');
    expect(state.turn).toBe('p2');
    expect(state.phase).toBe('waiting_action');
    expect(state.hands.p1).toHaveLength(3);
    expect(state.hands.p2).toHaveLength(3);
  });
});
