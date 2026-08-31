import {
  Card,
  GameAction,
  GameState,
  PlayerId
} from '../types';
import { compareCards } from '../card';
import { getAvailableActions, getOtherPlayer } from '../trucoStateMachine';
import { estimateEnvidoOdds } from './envidoEstimator';

export type BotDifficulty = 'novato' | 'intermedio' | 'canchero';

export interface BotDecisionConfig {
  difficulty: BotDifficulty;
  bluffRate?: number; // 0 to 1
}

export function chooseBotAction(
  state: GameState,
  botPlayer: PlayerId,
  config: BotDecisionConfig = { difficulty: 'canchero' }
): GameAction {
  const available = getAvailableActions(state, botPlayer);
  if (available.length === 0) {
    throw new Error(`Bot ${botPlayer} has no available actions`);
  }

  const otherPlayer = getOtherPlayer(botPlayer);
  const botHand = state.hands[botPlayer];
  const allBotCards = botHand.concat(state.playedCards[botPlayer]);
  const isMano = state.mano === botPlayer;
  const bluffThreshold = config.bluffRate ?? (config.difficulty === 'canchero' ? 0.15 : 0.05);

  // Helper to sort bot hand ascending by rank
  const sortedHandAsc = [...botHand].sort((a, b) => a.rank - b.rank);
  // Highest card
  const highestCard = sortedHandAsc[sortedHandAsc.length - 1];

  // ----------------------------------------------------
  // 1. FLOR CHALLENGE HANDLING
  // ----------------------------------------------------
  if (state.phase === 'flor_pending') {
    if (available.includes('CALL_CONTRAFLOR_AL_RESTO')) {
      if (Math.random() < 0.3) return { type: 'CALL_CONTRAFLOR_AL_RESTO', player: botPlayer };
    }
    if (available.includes('CALL_CONTRAFLOR')) {
      if (Math.random() < 0.6) return { type: 'CALL_CONTRAFLOR', player: botPlayer };
    }
    if (available.includes('QUIERO')) return { type: 'QUIERO', player: botPlayer };
    return { type: 'NO_QUIERO', player: botPlayer };
  }

  // ----------------------------------------------------
  // 2. ENVIDO CHALLENGE HANDLING
  // ----------------------------------------------------
  if (state.phase === 'envido_pending') {
    const odds = estimateEnvidoOdds(allBotCards, state.playedCards[otherPlayer], isMano);
    const lastCall = state.envido.history[state.envido.history.length - 1];

    if (lastCall === 'falta_envido') {
      if (odds.myValue >= 31 || (odds.myValue >= 29 && isMano) || odds.winProbability > 0.82) {
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    if (lastCall === 'real_envido') {
      if (odds.myValue >= 32 && available.includes('CALL_FALTA_ENVIDO')) {
        return { type: 'CALL_FALTA_ENVIDO', player: botPlayer };
      }
      if (odds.myValue >= 28 || odds.winProbability > 0.65) {
        return { type: 'QUIERO', player: botPlayer };
      }
      if (Math.random() < bluffThreshold) {
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    // Standard envido
    if (odds.myValue >= 31 && available.includes('CALL_FALTA_ENVIDO')) {
      return { type: 'CALL_FALTA_ENVIDO', player: botPlayer };
    }
    if (odds.myValue >= 29 && available.includes('CALL_REAL_ENVIDO')) {
      return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
    }
    if (odds.myValue >= 26 || (odds.myValue >= 24 && isMano) || odds.winProbability > 0.5) {
      return { type: 'QUIERO', player: botPlayer };
    }
    if (Math.random() < bluffThreshold && available.includes('CALL_REAL_ENVIDO')) {
      return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
    }
    return { type: 'NO_QUIERO', player: botPlayer };
  }

  // ----------------------------------------------------
  // 3. TRUCO CHALLENGE HANDLING
  // ----------------------------------------------------
  if (state.phase === 'truco_pending') {
    // "El envido está primero": if Truco was called before envido in 1st trick and bot has high envido
    if (available.includes('CALL_ENVIDO')) {
      const odds = estimateEnvidoOdds(allBotCards, [], isMano);
      if (odds.myValue >= 27) {
        if (odds.myValue >= 31 && available.includes('CALL_REAL_ENVIDO')) {
          return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
        }
        return { type: 'CALL_ENVIDO', player: botPlayer };
      }
    }

    const pending = state.truco.pendingLevel;
    const handPower = botHand.reduce((acc, c) => acc + c.rank, 0);
    const maxRank = highestCard ? highestCard.rank : 0;
    const trickIndex = state.currentTrickIndex;
    const trick1Winner = state.tricks[0]?.winner;

    // Check advantage
    const hasAdvantage = trick1Winner === botPlayer || (trick1Winner === 'parda' && isMano);

    if (pending === 'truco') {
      // Super strong hand: 1 de Espada (rank 14) or 1 de Basto (rank 13)
      if (maxRank >= 13 && available.includes('CALL_RETRUCO') && Math.random() < 0.75) {
        return { type: 'CALL_RETRUCO', player: botPlayer };
      }
      if (maxRank >= 9 || handPower >= 18 || hasAdvantage) {
        return { type: 'QUIERO', player: botPlayer };
      }
      if (Math.random() < bluffThreshold) {
        return available.includes('CALL_RETRUCO') && Math.random() < 0.4
          ? { type: 'CALL_RETRUCO', player: botPlayer }
          : { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    if (pending === 'retruco') {
      if (maxRank >= 13 && available.includes('CALL_VALE_CUATRO')) {
        return { type: 'CALL_VALE_CUATRO', player: botPlayer };
      }
      if (maxRank >= 10 && (hasAdvantage || trickIndex === 2)) {
        return { type: 'QUIERO', player: botPlayer };
      }
      if (maxRank >= 12) {
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    if (pending === 'vale_cuatro') {
      if (maxRank >= 13 || (maxRank >= 11 && hasAdvantage)) {
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }
  }

  // ----------------------------------------------------
  // 4. WAITING ACTION (CALLING ENVIDO / TRUCO OR PLAYING CARD)
  // ----------------------------------------------------
  if (state.phase === 'waiting_action') {
    // Flor call
    if (available.includes('CALL_FLOR')) {
      return { type: 'CALL_FLOR', player: botPlayer };
    }

    // Envido opening call
    if (available.includes('CALL_ENVIDO') || available.includes('CALL_REAL_ENVIDO') || available.includes('CALL_FALTA_ENVIDO')) {
      const odds = estimateEnvidoOdds(allBotCards, [], isMano);
      if (odds.myValue >= 31 && available.includes('CALL_REAL_ENVIDO')) {
        return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
      }
      if (odds.myValue >= 28 || (odds.myValue >= 26 && isMano)) {
        return { type: 'CALL_ENVIDO', player: botPlayer };
      }
      if (Math.random() < bluffThreshold) {
        return { type: 'CALL_ENVIDO', player: botPlayer };
      }
    }

    // Truco calling logic before playing card
    const currentTrick = state.tricks[state.currentTrickIndex];
    const isLeadingTrick = currentTrick.cards.length === 0;
    const maxRank = highestCard ? highestCard.rank : 0;

    if (available.includes('CALL_TRUCO')) {
      // In trick 2 if bot won trick 1, or in trick 1 if holding monster hand
      const wonT1 = state.tricks[0]?.winner === botPlayer;
      if (wonT1 && maxRank >= 10 && Math.random() < 0.8) {
        return { type: 'CALL_TRUCO', player: botPlayer };
      }
      if (state.currentTrickIndex === 0 && maxRank >= 13 && Math.random() < 0.6) {
        return { type: 'CALL_TRUCO', player: botPlayer };
      }
      if (Math.random() < bluffThreshold) {
        return { type: 'CALL_TRUCO', player: botPlayer };
      }
    }

    if (available.includes('CALL_RETRUCO')) {
      if (maxRank >= 12 && Math.random() < 0.7) {
        return { type: 'CALL_RETRUCO', player: botPlayer };
      }
    }

    if (available.includes('CALL_VALE_CUATRO')) {
      if (maxRank >= 13) {
        return { type: 'CALL_VALE_CUATRO', player: botPlayer };
      }
    }

    // Card selection tactics
    if (available.includes('PLAY_CARD')) {
      const chosenCard = pickBestCardToPlay(state, botPlayer, sortedHandAsc, isLeadingTrick);
      return { type: 'PLAY_CARD', player: botPlayer, card: chosenCard };
    }
  }

  // Fallback
  if (available.includes('PLAY_CARD')) {
    return { type: 'PLAY_CARD', player: botPlayer, card: botHand[0] };
  }
  if (available.includes('QUIERO')) return { type: 'QUIERO', player: botPlayer };
  if (available.includes('NO_QUIERO')) return { type: 'NO_QUIERO', player: botPlayer };
  return { type: 'IRSE_AL_MAZO', player: botPlayer };
}

function pickBestCardToPlay(
  state: GameState,
  botPlayer: PlayerId,
  sortedHandAsc: Card[],
  isLeading: boolean
): Card {
  const trickIdx = state.currentTrickIndex;
  const currentTrick = state.tricks[trickIdx];
  const lowest = sortedHandAsc[0];
  const highest = sortedHandAsc[sortedHandAsc.length - 1];

  if (isLeading) {
    // Leading Trick 1:
    if (trickIdx === 0) {
      // If we have a medium-high card (like a 3 or 2, rank 9-10) and an Ancho (rank 13-14), lead with the 3/2!
      const midHigh = sortedHandAsc.find(c => c.rank >= 9 && c.rank <= 11);
      if (midHigh && highest.rank >= 13) {
        return midHigh;
      }
      // If all low cards, lead highest of the low
      if (highest.rank <= 8) {
        return highest;
      }
      // Default: lead second highest or highest
      return sortedHandAsc.length > 1 ? sortedHandAsc[sortedHandAsc.length - 2] : highest;
    }

    // Leading Trick 2:
    if (trickIdx === 1) {
      const wonT1 = state.tricks[0]?.winner === botPlayer;
      if (wonT1) {
        // We won trick 1! Play our lowest card to see opponent's card, keeping the best for trick 3
        return lowest;
      } else {
        // We lost trick 1 or parda: MUST play highest card to win or stay alive!
        return highest;
      }
    }

    // Leading Trick 3:
    return highest;
  } else {
    // Responding to opponent's played card
    const oppCard = currentTrick.cards[0].card;

    // Find all cards in hand that beat opponent's card
    const winningCards = sortedHandAsc.filter(c => compareCards(c, oppCard) > 0);
    // Find tying cards
    const tyingCards = sortedHandAsc.filter(c => compareCards(c, oppCard) === 0);

    if (winningCards.length > 0) {
      // Play the LOWEST winning card (economical kill)
      return winningCards[0];
    }

    // Check if tying is advantageous
    const t1Winner = state.tricks[0]?.winner;
    if (tyingCards.length > 0) {
      if (trickIdx === 0 && state.mano === botPlayer) {
        // Tying trick 1 when Mano gives us trick 1 parda advantage
        return tyingCards[0];
      }
      if (trickIdx === 1 && t1Winner === botPlayer) {
        // Tying trick 2 when we won trick 1 immediately wins the hand!
        return tyingCards[0];
      }
      if (trickIdx === 2 && t1Winner === botPlayer) {
        // Tying trick 3 when we won trick 1 wins the hand!
        return tyingCards[0];
      }
    }

    // Cannot win or tie: throw away the weakest/lowest card
    return lowest;
  }
}
