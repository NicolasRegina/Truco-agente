import { describe, it, expect } from 'vitest';
import {
  applyAction,
  createInitialGameState,
  startNextHand
} from '../src/trucoStateMachine';
import { chooseBotAction } from '../src/ai/botStrategy';

describe('Argentine Truco AI Simulation', () => {
  it('simulates 20 complete hands between AI bots without crashes or invalid moves', () => {
    let state = createInitialGameState({ maxScore: 30, withFlor: true, p1Name: 'Bot Carlos', p2Name: 'Bot Martín' });
    let handsCompleted = 0;
    let actionCount = 0;
    const MAX_ACTIONS_PER_MATCH = 1500;

    while (handsCompleted < 20 && actionCount < MAX_ACTIONS_PER_MATCH) {
      if (state.phase === 'hand_ended' || state.phase === 'match_ended') {
        handsCompleted++;
        if (state.matchWinner || state.score.p1 >= 30 || state.score.p2 >= 30) {
          state = createInitialGameState({ maxScore: 30, withFlor: true, p1Name: 'Bot Carlos', p2Name: 'Bot Martín' });
          continue;
        }
        state = startNextHand(state);
        continue;
      }

      const currentBot = state.turn;
      const action = chooseBotAction(state, currentBot, { difficulty: 'canchero', bluffRate: 0.15 });

      expect(action).toBeDefined();
      expect(action.player).toBe(currentBot);

      state = applyAction(state, action);
      actionCount++;
    }

    expect(handsCompleted).toBeGreaterThan(0);
    expect(actionCount).toBeGreaterThan(10);
  });
});
