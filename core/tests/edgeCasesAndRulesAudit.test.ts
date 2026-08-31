import { describe, it, expect } from 'vitest';
import { createCard } from '../src/card';
import {
  applyAction,
  createInitialGameState,
  getAvailableActions
} from '../src/trucoStateMachine';
import { calculateFaltaEnvidoPoints } from '../src/envido';

describe('Truco Argentino Edge Cases & Rules Audit', () => {
  it('enforces "El Envido está primero" when Truco is called in Trick 1', () => {
    // P1 calls Truco right away
    let state = createInitialGameState({ maxScore: 30, withFlor: false });
    expect(state.turn).toBe('p1');

    state = applyAction(state, { type: 'CALL_TRUCO', player: 'p1' });
    expect(state.phase).toBe('truco_pending');
    expect(state.turn).toBe('p2');

    // P2 has the option to respond with CALL_ENVIDO
    const p2Actions = getAvailableActions(state, 'p2');
    expect(p2Actions).toContain('CALL_ENVIDO');
    expect(p2Actions).toContain('CALL_REAL_ENVIDO');
    expect(p2Actions).toContain('CALL_FALTA_ENVIDO');
    expect(p2Actions).toContain('QUIERO');
    expect(p2Actions).toContain('NO_QUIERO');

    // P2 calls Envido
    state = applyAction(state, { type: 'CALL_ENVIDO', player: 'p2' });
    expect(state.phase).toBe('envido_pending');
    expect(state.turn).toBe('p1');

    // P1 says No Quiero to Envido
    state = applyAction(state, { type: 'NO_QUIERO', player: 'p1' });
    expect(state.score.p2).toBe(1); // P2 gets 1 pt for declined envido
    expect(state.envido.isResolved).toBe(true);

    // Game state MUST now resume the pending Truco challenge for P2!
    expect(state.phase).toBe('truco_pending');
    expect(state.turn).toBe('p2');

    // P2 accepts the Truco
    state = applyAction(state, { type: 'QUIERO', player: 'p2' });
    expect(state.phase).toBe('waiting_action');
    expect(state.truco.currentLevel).toBe('truco');
    expect(state.turn).toBe('p1'); // P1 is Mano and plays first card
  });

  it('cancels Envido when Flor is sung ("Flor anula el envido")', () => {
    // P1 calls Envido
    // P2 has Flor (3 espadas)
    const customDeck = () => [
      createCard(4, 'copa'), createCard(7, 'espada'),
      createCard(5, 'basto'), createCard(6, 'espada'),
      createCard(6, 'oro'), createCard(1, 'espada')
    ];

    let state = createInitialGameState({ maxScore: 30, withFlor: true }, customDeck);
    state = applyAction(state, { type: 'CALL_ENVIDO', player: 'p1' });
    expect(state.phase).toBe('envido_pending');
    expect(state.turn).toBe('p2');

    const p2Actions = getAvailableActions(state, 'p2');
    expect(p2Actions).toContain('CALL_FLOR');

    // P2 sings Flor!
    state = applyAction(state, { type: 'CALL_FLOR', player: 'p2' });
    expect(state.flor.isResolved).toBe(true);
    expect(state.envido.isResolved).toBe(true); // Envido cancelled without points
    expect(state.score.p2).toBe(3); // 3 points for Flor
    expect(state.phase).toBe('waiting_action');
  });

  it('awards correct points when folding (IRSE_AL_MAZO) in various states', () => {
    // 1. Fold in trick 1 before Envido -> Opponent gets 1 pt envido + 1 pt truco = 2 pts
    let state1 = createInitialGameState({ maxScore: 30, withFlor: false });
    state1 = applyAction(state1, { type: 'IRSE_AL_MAZO', player: 'p1' });
    expect(state1.phase).toBe('hand_ended');
    expect(state1.score.p2).toBe(2); // 1 envido + 1 truco

    // 2. Fold during Truco challenge -> Opponent gets 1 pt truco
    let state2 = createInitialGameState({ maxScore: 30, withFlor: false });
    state2 = applyAction(state2, { type: 'CALL_TRUCO', player: 'p1' });
    state2 = applyAction(state2, { type: 'IRSE_AL_MAZO', player: 'p2' });
    expect(state2.score.p1).toBe(2); // 1 pt envido (unresolved trick 1) + 1 pt truco fold

    // 3. Fold during Retruco challenge in Trick 1 (before envido) -> 1 pt envido + 2 pts truco = 3 pts
    let state3 = createInitialGameState({ maxScore: 30, withFlor: false });
    state3 = applyAction(state3, { type: 'CALL_TRUCO', player: 'p1' });
    state3 = applyAction(state3, { type: 'QUIERO', player: 'p2' });
    state3 = applyAction(state3, { type: 'CALL_RETRUCO', player: 'p2' });
    state3 = applyAction(state3, { type: 'IRSE_AL_MAZO', player: 'p1' });
    expect(state3.score.p2).toBe(3); // 1 pt envido + 2 pts truco

    // 4. Fold during Retruco challenge in Trick 2 (after trick 1 played, envido closed) -> 2 pts
    let state4 = createInitialGameState({ maxScore: 30, withFlor: false });
    // Play trick 1
    state4 = applyAction(state4, { type: 'PLAY_CARD', player: 'p1', card: state4.hands.p1[0] });
    state4 = applyAction(state4, { type: 'PLAY_CARD', player: 'p2', card: state4.hands.p2[0] });
    // In trick 2, Truco -> Retruco -> Fold
    state4 = applyAction(state4, { type: 'CALL_TRUCO', player: state4.turn });
    const opp = state4.turn;
    state4 = applyAction(state4, { type: 'QUIERO', player: opp });
    state4 = applyAction(state4, { type: 'CALL_RETRUCO', player: opp });
    const foldingPlayer = state4.turn;
    const winningPlayer = opp;
    state4 = applyAction(state4, { type: 'IRSE_AL_MAZO', player: foldingPlayer });
    expect(state4.score[winningPlayer]).toBe(2); // Exactly 2 pts (no envido in trick 2)
  });

  it('accurately computes Falta Envido across all match scores and stages', () => {
    // 30 pt match in Malas (p1: 6, p2: 12) -> leader has 12, needs 18 pts
    expect(calculateFaltaEnvidoPoints({ p1: 6, p2: 12 }, 30)).toBe(18);

    // 30 pt match in Buenas (p1: 22, p2: 18) -> leader has 22, needs 8 pts to win
    expect(calculateFaltaEnvidoPoints({ p1: 22, p2: 18 }, 30)).toBe(8);

    // 15 pt match (p1: 10, p2: 8) -> leader has 10, needs 5 pts
    expect(calculateFaltaEnvidoPoints({ p1: 10, p2: 8 }, 15)).toBe(5);

    // 15 pt match at 0-0 -> needs 15 pts
    expect(calculateFaltaEnvidoPoints({ p1: 0, p2: 0 }, 15)).toBe(15);
  });
});
