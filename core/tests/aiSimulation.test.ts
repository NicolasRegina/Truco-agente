import { describe, it, expect } from 'vitest';
import {
  applyAction,
  createInitialGameState,
  startNextHand
} from '../src/trucoStateMachine';
import { chooseBotAction, BotDifficulty } from '../src/ai/botStrategy';

describe('Argentine Truco AI Simulation', () => {
  const difficulties: BotDifficulty[] = ['facil', 'medio', 'dificil'];

  difficulties.forEach((diff) => {
    it(`simulates 15 complete hands using difficulty '${diff}' without crashes or invalid moves`, () => {
      let state = createInitialGameState({ maxScore: 30, withFlor: true, p1Name: 'Bot P1', p2Name: 'Bot P2' });
      let handsCompleted = 0;
      let actionCount = 0;
      const MAX_ACTIONS_PER_MATCH = 1500;

      while (handsCompleted < 15 && actionCount < MAX_ACTIONS_PER_MATCH) {
        if (state.phase === 'hand_ended' || state.phase === 'match_ended') {
          handsCompleted++;
          if (state.matchWinner || state.score.p1 >= 30 || state.score.p2 >= 30) {
            state = createInitialGameState({ maxScore: 30, withFlor: true, p1Name: 'Bot P1', p2Name: 'Bot P2' });
            continue;
          }
          state = startNextHand(state);
          continue;
        }

        const currentBot = state.turn;
        const action = chooseBotAction(state, currentBot, { difficulty: diff });

        expect(action).toBeDefined();
        expect(action.player).toBe(currentBot);

        state = applyAction(state, action);
        actionCount++;
      }

      expect(handsCompleted).toBeGreaterThan(0);
      expect(actionCount).toBeGreaterThan(10);
    });
  });
});
