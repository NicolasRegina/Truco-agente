import {
  Card,
  GameAction,
  GameState,
  PlayerId
} from '../types';
import { compareCards } from '../card';
import { getAvailableActions, getOtherPlayer } from '../trucoStateMachine';
import { estimateEnvidoOdds } from './envidoEstimator';

export type BotDifficulty = 'facil' | 'medio' | 'dificil' | 'novato' | 'intermedio' | 'canchero';

export interface BotDecisionConfig {
  difficulty: BotDifficulty;
  bluffRate?: number; // 0 to 1
}

export function normalizeDifficulty(diff?: BotDifficulty): 'facil' | 'medio' | 'dificil' {
  if (diff === 'novato' || diff === 'facil') return 'facil';
  if (diff === 'intermedio' || diff === 'medio') return 'medio';
  return 'dificil';
}

export function chooseBotAction(
  state: GameState,
  botPlayer: PlayerId,
  config: BotDecisionConfig = { difficulty: 'dificil' }
): GameAction {
  const available = getAvailableActions(state, botPlayer);
  if (available.length === 0) {
    throw new Error(`Bot ${botPlayer} has no available actions`);
  }

  const diff = normalizeDifficulty(config.difficulty);
  const otherPlayer = getOtherPlayer(botPlayer);
  const botHand = state.hands[botPlayer];
  const allBotCards = botHand.concat(state.playedCards[botPlayer]);
  const isMano = state.mano === botPlayer;

  // Difficulty-scaled bluffing thresholds
  let defaultBluffRate = 0.06;
  if (diff === 'facil') defaultBluffRate = 0.02;      // Casi nunca miente (2%)
  else if (diff === 'dificil') defaultBluffRate = 0.18; // Farol estratégico frecuente (18%)

  const bluffThreshold = config.bluffRate ?? defaultBluffRate;

  // Helper to sort bot hand ascending by rank
  const sortedHandAsc = [...botHand].sort((a, b) => a.rank - b.rank);
  const highestCard = sortedHandAsc[sortedHandAsc.length - 1];

  // ----------------------------------------------------
  // 1. FLOR CHALLENGE HANDLING
  // ----------------------------------------------------
  if (state.phase === 'flor_pending') {
    if (diff === 'dificil' && available.includes('CALL_CONTRAFLOR_AL_RESTO')) {
      if (Math.random() < 0.4) return { type: 'CALL_CONTRAFLOR_AL_RESTO', player: botPlayer };
    }
    if (available.includes('CALL_CONTRAFLOR')) {
      const prob = diff === 'facil' ? 0.3 : diff === 'medio' ? 0.6 : 0.8;
      if (Math.random() < prob) return { type: 'CALL_CONTRAFLOR', player: botPlayer };
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

    if (diff === 'facil') {
      // DIFICULTAD FÁCIL: No hace cálculos bayesianos finos y es muy conservador
      if (lastCall === 'falta_envido') {
        if (odds.myValue >= 31 || (odds.myValue >= 30 && isMano)) {
          return { type: 'QUIERO', player: botPlayer };
        }
        return { type: 'NO_QUIERO', player: botPlayer };
      }

      if (lastCall === 'real_envido') {
        if (odds.myValue >= 29) {
          return { type: 'QUIERO', player: botPlayer };
        }
        return { type: 'NO_QUIERO', player: botPlayer };
      }

      // Envido estándar
      if (odds.myValue >= 27 || (odds.myValue >= 25 && isMano)) {
        if (odds.myValue >= 32 && available.includes('CALL_REAL_ENVIDO')) {
          return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
        }
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    if (diff === 'medio') {
      // DIFICULTAD MEDIA: Reglas criollas clásicas
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

      // Envido estándar
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

    // DIFICULTAD DIFÍCIL: Agresivo, lee ventajas y arriesga con criterio
    if (lastCall === 'falta_envido') {
      if (odds.myValue >= 30 || (odds.myValue >= 28 && isMano) || odds.winProbability > 0.75) {
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    if (lastCall === 'real_envido') {
      if (odds.myValue >= 31 && available.includes('CALL_FALTA_ENVIDO')) {
        return { type: 'CALL_FALTA_ENVIDO', player: botPlayer };
      }
      if (odds.myValue >= 27 || (odds.myValue >= 25 && isMano) || odds.winProbability > 0.60) {
        return { type: 'QUIERO', player: botPlayer };
      }
      if (Math.random() < bluffThreshold) {
        if (available.includes('CALL_FALTA_ENVIDO') && Math.random() < 0.25) {
          return { type: 'CALL_FALTA_ENVIDO', player: botPlayer };
        }
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }

    // Envido estándar
    if (odds.myValue >= 30 && available.includes('CALL_FALTA_ENVIDO')) {
      return { type: 'CALL_FALTA_ENVIDO', player: botPlayer };
    }
    if (odds.myValue >= 28 && available.includes('CALL_REAL_ENVIDO')) {
      return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
    }
    if (odds.myValue >= 25 || (odds.myValue >= 23 && isMano) || odds.winProbability > 0.45) {
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
    const pending = state.truco.pendingLevel;
    const handPower = botHand.reduce((acc, c) => acc + c.rank, 0);
    const maxRank = highestCard ? highestCard.rank : 0;
    const trickIndex = state.currentTrickIndex;
    const trick1Winner = state.tricks[0]?.winner;
    const hasAdvantage = trick1Winner === botPlayer || (trick1Winner === 'parda' && isMano);

    // "El envido está primero"
    if (available.includes('CALL_ENVIDO')) {
      const odds = estimateEnvidoOdds(allBotCards, [], isMano);
      const minEnvidoThreshold = diff === 'facil' ? 29 : diff === 'medio' ? 27 : 25;
      if (odds.myValue >= minEnvidoThreshold) {
        if (odds.myValue >= 31 && available.includes('CALL_REAL_ENVIDO')) {
          return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
        }
        return { type: 'CALL_ENVIDO', player: botPlayer };
      }
    }

    if (diff === 'facil') {
      // DIFICULTAD FÁCIL: Muy temeroso ante apuestas
      if (pending === 'truco') {
        if (maxRank >= 11 || (hasAdvantage && maxRank >= 8)) {
          if (maxRank === 14 && available.includes('CALL_RETRUCO') && Math.random() < 0.4) {
            return { type: 'CALL_RETRUCO', player: botPlayer };
          }
          return { type: 'QUIERO', player: botPlayer };
        }
        return { type: 'NO_QUIERO', player: botPlayer };
      }
      if (pending === 'retruco') {
        if (maxRank >= 13) return { type: 'QUIERO', player: botPlayer };
        return { type: 'NO_QUIERO', player: botPlayer };
      }
      if (pending === 'vale_cuatro') {
        if (maxRank === 14) return { type: 'QUIERO', player: botPlayer };
        return { type: 'NO_QUIERO', player: botPlayer };
      }
    }

    if (diff === 'medio') {
      // DIFICULTAD MEDIA: Clásico y equilibrado
      if (pending === 'truco') {
        if (maxRank >= 13 && available.includes('CALL_RETRUCO') && Math.random() < 0.70) {
          return { type: 'CALL_RETRUCO', player: botPlayer };
        }
        if (maxRank >= 9 || handPower >= 18 || hasAdvantage) {
          return { type: 'QUIERO', player: botPlayer };
        }
        if (Math.random() < bluffThreshold) {
          return available.includes('CALL_RETRUCO') && Math.random() < 0.3
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
        if (maxRank >= 12) return { type: 'QUIERO', player: botPlayer };
        return { type: 'NO_QUIERO', player: botPlayer };
      }
      if (pending === 'vale_cuatro') {
        if (maxRank >= 13 || (maxRank >= 11 && hasAdvantage)) {
          return { type: 'QUIERO', player: botPlayer };
        }
        return { type: 'NO_QUIERO', player: botPlayer };
      }
    }

    // DIFICULTAD DIFÍCIL: Presión alta, retruca con maña
    if (pending === 'truco') {
      if (maxRank >= 12 && available.includes('CALL_RETRUCO') && Math.random() < 0.85) {
        return { type: 'CALL_RETRUCO', player: botPlayer };
      }
      if (maxRank >= 8 || handPower >= 16 || hasAdvantage) {
        return { type: 'QUIERO', player: botPlayer };
      }
      if (Math.random() < bluffThreshold) {
        return available.includes('CALL_RETRUCO') && Math.random() < 0.5
          ? { type: 'CALL_RETRUCO', player: botPlayer }
          : { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }
    if (pending === 'retruco') {
      if (maxRank >= 12 && available.includes('CALL_VALE_CUATRO') && Math.random() < 0.75) {
        return { type: 'CALL_VALE_CUATRO', player: botPlayer };
      }
      if (maxRank >= 9 && (hasAdvantage || trickIndex === 2)) {
        return { type: 'QUIERO', player: botPlayer };
      }
      if (maxRank >= 11) return { type: 'QUIERO', player: botPlayer };
      if (Math.random() < bluffThreshold) return { type: 'QUIERO', player: botPlayer };
      return { type: 'NO_QUIERO', player: botPlayer };
    }
    if (pending === 'vale_cuatro') {
      if (maxRank >= 12 || (maxRank >= 10 && hasAdvantage)) {
        return { type: 'QUIERO', player: botPlayer };
      }
      return { type: 'NO_QUIERO', player: botPlayer };
    }
  }

  // ----------------------------------------------------
  // 4. WAITING ACTION (OPENING ENVIDO/TRUCO OR PLAYING CARD)
  // ----------------------------------------------------
  if (state.phase === 'waiting_action') {
    if (available.includes('CALL_FLOR')) {
      return { type: 'CALL_FLOR', player: botPlayer };
    }

    // Aperturas de Envido
    if (available.includes('CALL_ENVIDO') || available.includes('CALL_REAL_ENVIDO') || available.includes('CALL_FALTA_ENVIDO')) {
      const odds = estimateEnvidoOdds(allBotCards, [], isMano);

      if (diff === 'facil') {
        if (odds.myValue >= 28 && available.includes('CALL_ENVIDO')) {
          return { type: 'CALL_ENVIDO', player: botPlayer };
        }
      } else if (diff === 'medio') {
        if (odds.myValue >= 31 && available.includes('CALL_REAL_ENVIDO')) {
          return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
        }
        if (odds.myValue >= 28 || (odds.myValue >= 26 && isMano)) {
          return { type: 'CALL_ENVIDO', player: botPlayer };
        }
        if (Math.random() < bluffThreshold) {
          return { type: 'CALL_ENVIDO', player: botPlayer };
        }
      } else {
        // Dificil: Si el rival no cantó siendo mano, el bot deduce debilidad y roba con 24+
        if (!isMano && odds.myValue >= 24 && available.includes('CALL_ENVIDO')) {
          return { type: 'CALL_ENVIDO', player: botPlayer };
        }
        if (odds.myValue >= 32 && available.includes('CALL_FALTA_ENVIDO')) {
          return { type: 'CALL_FALTA_ENVIDO', player: botPlayer };
        }
        if (odds.myValue >= 30 && available.includes('CALL_REAL_ENVIDO')) {
          return { type: 'CALL_REAL_ENVIDO', player: botPlayer };
        }
        if (odds.myValue >= 27 || (odds.myValue >= 25 && isMano)) {
          return { type: 'CALL_ENVIDO', player: botPlayer };
        }
        if (Math.random() < bluffThreshold) {
          return available.includes('CALL_REAL_ENVIDO') && Math.random() < 0.4
            ? { type: 'CALL_REAL_ENVIDO', player: botPlayer }
            : { type: 'CALL_ENVIDO', player: botPlayer };
        }
      }
    }

    // Grito de Truco antes de tirar carta
    const currentTrick = state.tricks[state.currentTrickIndex];
    const isLeadingTrick = currentTrick.cards.length === 0;
    const maxRank = highestCard ? highestCard.rank : 0;
    const wonT1 = state.tricks[0]?.winner === botPlayer;

    if (available.includes('CALL_TRUCO')) {
      if (diff === 'facil') {
        if (wonT1 && maxRank >= 12 && Math.random() < 0.5) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
      } else if (diff === 'medio') {
        if (wonT1 && maxRank >= 10 && Math.random() < 0.8) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
        if (state.currentTrickIndex === 0 && maxRank >= 13 && Math.random() < 0.6) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
        if (Math.random() < bluffThreshold) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
      } else {
        // Dificil: Asfixia de Truco si ganó 1ª baza
        if (wonT1 && maxRank >= 9 && Math.random() < 0.92) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
        if (state.currentTrickIndex === 0 && maxRank >= 12 && Math.random() < 0.75) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
        if (Math.random() < bluffThreshold) {
          return { type: 'CALL_TRUCO', player: botPlayer };
        }
      }
    }

    if (available.includes('CALL_RETRUCO')) {
      const minRetrucoRank = diff === 'facil' ? 14 : diff === 'medio' ? 12 : 11;
      if (maxRank >= minRetrucoRank && Math.random() < 0.8) {
        return { type: 'CALL_RETRUCO', player: botPlayer };
      }
      if (diff === 'dificil' && Math.random() < bluffThreshold * 0.8) {
        return { type: 'CALL_RETRUCO', player: botPlayer };
      }
    }

    if (available.includes('CALL_VALE_CUATRO')) {
      const minValeRank = diff === 'facil' ? 14 : 13;
      if (maxRank >= minValeRank) {
        return { type: 'CALL_VALE_CUATRO', player: botPlayer };
      }
    }

    // Selección de carta a jugar según táctica de dificultad
    if (available.includes('PLAY_CARD')) {
      const chosenCard = pickBestCardToPlay(state, botPlayer, sortedHandAsc, isLeadingTrick, diff);
      return { type: 'PLAY_CARD', player: botPlayer, card: chosenCard };
    }
  }

  // Fallbacks de seguridad
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
  isLeading: boolean,
  diff: 'facil' | 'medio' | 'dificil'
): Card {
  const trickIdx = state.currentTrickIndex;
  const currentTrick = state.tricks[trickIdx];
  const lowest = sortedHandAsc[0];
  const highest = sortedHandAsc[sortedHandAsc.length - 1];

  if (isLeading) {
    // ------------------------------------
    // Saliendo de mano en 1ª Baza:
    // ------------------------------------
    if (trickIdx === 0) {
      if (diff === 'facil') {
        // Fácil / Novato: Si tiene una carta alta, la gasta de inmediato para asegurar primera
        if (highest.rank >= 10) {
          return highest;
        }
        return sortedHandAsc[Math.floor(sortedHandAsc.length / 2)] || lowest;
      }

      if (diff === 'medio') {
        // Medio: Si tiene un 2 o 3 (rango 9-11) y un As bravo (13-14), abre con el 2 o 3 y reserva el As
        const midHigh = sortedHandAsc.find(c => c.rank >= 9 && c.rank <= 11);
        if (midHigh && highest.rank >= 13) {
          return midHigh;
        }
        if (highest.rank <= 8) return highest;
        return sortedHandAsc.length > 1 ? sortedHandAsc[sortedHandAsc.length - 2] : highest;
      }

      // Difícil: Estratégico.
      // Si tiene dos cartas descomunales (ej: 13 y 14), a veces tira la más baja para tender una trampa de Truco
      if (sortedHandAsc.length >= 2 && sortedHandAsc[sortedHandAsc.length - 2].rank >= 12 && Math.random() < 0.3) {
        return lowest;
      }
      const midHigh = sortedHandAsc.find(c => c.rank >= 9 && c.rank <= 11);
      if (midHigh && highest.rank >= 13) {
        return midHigh;
      }
      if (highest.rank <= 8) return highest;
      return sortedHandAsc.length > 1 ? sortedHandAsc[sortedHandAsc.length - 2] : highest;
    }

    // ------------------------------------
    // Saliendo en 2ª Baza:
    // ------------------------------------
    if (trickIdx === 1) {
      const wonT1 = state.tricks[0]?.winner === botPlayer;
      if (wonT1) {
        if (diff === 'facil') {
          // Fácil no sabe achicar: vuelve a tirar su carta más fuerte
          return highest;
        }
        // Medio y Difícil: ¡Ganó 1ª baza! "Achica" con su carta más baja para guardar el remate
        return lowest;
      } else {
        // Perdió o hubo parda: Obligado a matar o empatar con su carta más alta
        return highest;
      }
    }

    // ------------------------------------
    // Saliendo en 3ª Baza (Definición):
    // ------------------------------------
    return highest;
  } else {
    // ------------------------------------
    // Respondiendo a la carta del rival:
    // ------------------------------------
    const oppCard = currentTrick.cards[0].card;
    const winningCards = sortedHandAsc.filter(c => compareCards(c, oppCard) > 0);
    const tyingCards = sortedHandAsc.filter(c => compareCards(c, oppCard) === 0);

    if (diff === 'facil') {
      // Fácil: No calcula la mata económica; si tiene para ganar, a veces tira su mejor carta
      if (winningCards.length > 0) {
        return Math.random() < 0.65 ? winningCards[winningCards.length - 1] : winningCards[0];
      }
      return lowest;
    }

    // Medio y Difícil:
    // 1. Aprovechar ventaja de parda
    const t1Winner = state.tricks[0]?.winner;
    if (tyingCards.length > 0) {
      if (trickIdx === 0 && state.mano === botPlayer) {
        // En 1ª baza, siendo mano, pardear asegura ventaja para definir en 2ª
        return tyingCards[0];
      }
      if (trickIdx === 1 && t1Winner === botPlayer) {
        // En 2ª baza habiendo ganado 1ª, pardear gana la mano automáticamente
        return tyingCards[0];
      }
      if (trickIdx === 2 && t1Winner === botPlayer) {
        // En 3ª baza habiendo ganado 1ª, pardear también gana
        return tyingCards[0];
      }
    }

    // 2. Mata económica: Mata con la carta más chica posible que supere al rival
    if (winningCards.length > 0) {
      return winningCards[0];
    }

    // 3. En Difícil, si no puede ganar en 1ª pero puede empatar, busca el empate
    if (diff === 'dificil' && trickIdx === 0 && tyingCards.length > 0) {
      return tyingCards[0];
    }

    // No puede ganar ni empatar: tira la carta más débil / descarte
    return lowest;
  }
}
