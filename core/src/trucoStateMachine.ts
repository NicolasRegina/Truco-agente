import {
  ActionType,
  Card,
  EnvidoCallType,
  FlorCallType,
  GameAction,
  GameState,
  HandLogEntry,
  MatchConfig,
  PlayerId,
  TrickWinner,
  TrucoBetLevel
} from './types';
import { compareCards, createDeck, formatCardName, shuffleDeck } from './card';
import { compareEnvido, getEnvidoStakes } from './envido';
import { compareFlor, getFlorStakes, hasFlor } from './flor';

export function createInitialGameState(
  config: MatchConfig = { maxScore: 30, withFlor: false },
  deckProvider?: () => Card[]
): GameState {
  const deck = deckProvider ? deckProvider() : shuffleDeck(createDeck());
  const p1Cards = [deck[0], deck[2], deck[4]];
  const p2Cards = [deck[1], deck[3], deck[5]];

  const state: GameState = {
    config,
    score: { p1: 0, p2: 0 },
    handNumber: 1,
    dealer: 'p2',
    mano: 'p1',
    turn: 'p1',
    phase: 'waiting_action',
    hands: {
      p1: p1Cards,
      p2: p2Cards
    },
    playedCards: {
      p1: [],
      p2: []
    },
    tricks: [
      { number: 1, cards: [] },
      { number: 2, cards: [] },
      { number: 3, cards: [] }
    ],
    currentTrickIndex: 0,
    envido: {
      isResolved: false,
      history: [],
      currentCall: null,
      caller: null,
      challengedPlayer: null,
      acceptedValue: 0,
      declinedValue: 0
    },
    flor: {
      isResolved: false,
      history: [],
      currentCall: null,
      caller: null,
      challengedPlayer: null,
      acceptedValue: 0,
      declinedValue: 0
    },
    truco: {
      currentLevel: 'none',
      caller: null,
      challengedPlayer: null,
      pendingLevel: null,
      lastAcceptedBy: null
    },
    handWinner: null,
    matchWinner: null,
    logs: [
      { text: `Comienza la partida a ${config.maxScore} puntos. Mano: ${config.p1Name || 'Jugador 1'}.`, type: 'info' }
    ]
  };

  return state;
}

export function getOtherPlayer(player: PlayerId): PlayerId {
  return player === 'p1' ? 'p2' : 'p1';
}

export function getAvailableActions(state: GameState, player: PlayerId): ActionType[] {
  if (state.phase === 'hand_ended' || state.phase === 'match_ended') {
    return [];
  }

  if (state.turn !== player) {
    return [];
  }

  const actions: ActionType[] = [];

  if (state.phase === 'waiting_action') {
    // 1. Can play any card in hand
    if (state.hands[player].length > 0) {
      actions.push('PLAY_CARD');
    }

    // 2. Envido calls (only in trick 1, if envido not resolved, and no card played by this player unless responding to trick 1 lead)
    const isFirstTrick = state.currentTrickIndex === 0;
    const cardsPlayedByPlayer = state.playedCards[player].length;
    const canCallEnvidoNow = isFirstTrick && !state.envido.isResolved && cardsPlayedByPlayer === 0 && state.truco.currentLevel === 'none';

    if (canCallEnvidoNow) {
      actions.push('CALL_ENVIDO');
      actions.push('CALL_REAL_ENVIDO');
      actions.push('CALL_FALTA_ENVIDO');
    }

    // 3. Flor calls (if withFlor enabled and player has Flor)
    if (state.config.withFlor && !state.flor.isResolved && isFirstTrick && cardsPlayedByPlayer === 0) {
      if (hasFlor(state.hands[player].concat(state.playedCards[player]))) {
        actions.push('CALL_FLOR');
      }
    }

    // 4. Truco / Retruco / Vale Cuatro
    if (state.truco.currentLevel === 'none') {
      actions.push('CALL_TRUCO');
    } else if (state.truco.currentLevel === 'truco' && state.truco.lastAcceptedBy === player) {
      actions.push('CALL_RETRUCO');
    } else if (state.truco.currentLevel === 'retruco' && state.truco.lastAcceptedBy === player) {
      actions.push('CALL_VALE_CUATRO');
    }

    // 5. Irse al mazo (fold)
    actions.push('IRSE_AL_MAZO');
  } else if (state.phase === 'envido_pending') {
    actions.push('QUIERO');
    actions.push('NO_QUIERO');

    const history = state.envido.history;
    const lastCall = history[history.length - 1];

    if (lastCall === 'envido') {
      const envidoCount = history.filter(c => c === 'envido').length;
      if (envidoCount < 2) {
        actions.push('CALL_ENVIDO'); // Envido - Envido
      }
      actions.push('CALL_REAL_ENVIDO');
      actions.push('CALL_FALTA_ENVIDO');
    } else if (lastCall === 'real_envido') {
      actions.push('CALL_FALTA_ENVIDO');
    }

    // Argentine Rule: "Flor anula el Envido"
    if (state.config.withFlor && !state.flor.isResolved) {
      const allPlayerCards = state.hands[player].concat(state.playedCards[player]);
      if (hasFlor(allPlayerCards)) {
        actions.push('CALL_FLOR');
      }
    }

    actions.push('IRSE_AL_MAZO');
  } else if (state.phase === 'flor_pending') {
    actions.push('QUIERO');
    actions.push('NO_QUIERO');

    const lastCall = state.flor.history[state.flor.history.length - 1];
    if (lastCall === 'flor') {
      if (hasFlor(state.hands[player].concat(state.playedCards[player]))) {
        actions.push('CALL_CONTRAFLOR');
        actions.push('CALL_CONTRAFLOR_AL_RESTO');
      }
    } else if (lastCall === 'contraflor') {
      actions.push('CALL_CONTRAFLOR_AL_RESTO');
    }

    actions.push('IRSE_AL_MAZO');
  } else if (state.phase === 'truco_pending') {
    actions.push('QUIERO');
    actions.push('NO_QUIERO');

    if (state.truco.pendingLevel === 'truco') {
      actions.push('CALL_RETRUCO');

      // "El envido está primero": if Truco was called in 1st trick before envido resolved
      const isFirstTrick = state.currentTrickIndex === 0;
      if (isFirstTrick && !state.envido.isResolved && state.playedCards[player].length === 0) {
        actions.push('CALL_ENVIDO');
        actions.push('CALL_REAL_ENVIDO');
        actions.push('CALL_FALTA_ENVIDO');
      }
    } else if (state.truco.pendingLevel === 'retruco') {
      actions.push('CALL_VALE_CUATRO');
    }

    actions.push('IRSE_AL_MAZO');
  }

  return actions;
}

export function applyAction(currentState: GameState, action: GameAction): GameState {
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const player = action.player;
  const other = getOtherPlayer(player);
  const pName = player === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
  const oName = other === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');

  const addLog = (text: string, type: HandLogEntry['type'] = 'info') => {
    state.logs.push({ text, player, type });
  };

  const checkMatchWinner = () => {
    if (state.score.p1 >= state.config.maxScore) {
      state.matchWinner = 'p1';
      state.phase = 'match_ended';
      addLog(`¡${state.config.p1Name || 'Jugador 1'} ha ganado la partida!`, 'score');
      return true;
    }
    if (state.score.p2 >= state.config.maxScore) {
      state.matchWinner = 'p2';
      state.phase = 'match_ended';
      addLog(`¡${state.config.p2Name || 'Jugador 2'} ha ganado la partida!`, 'score');
      return true;
    }
    return false;
  };

  switch (action.type) {
    // ----------------------------------------------------
    // ENVIDO CALLS
    // ----------------------------------------------------
    case 'CALL_ENVIDO':
    case 'CALL_REAL_ENVIDO':
    case 'CALL_FALTA_ENVIDO': {
      const callType: EnvidoCallType =
        action.type === 'CALL_ENVIDO'
          ? 'envido'
          : action.type === 'CALL_REAL_ENVIDO'
          ? 'real_envido'
          : 'falta_envido';

      state.envido.history.push(callType);
      state.envido.currentCall = callType;
      state.envido.caller = player;
      state.envido.challengedPlayer = other;
      state.phase = 'envido_pending';
      state.turn = other;

      const callLabels: Record<EnvidoCallType, string> = {
        envido: '¡Envido!',
        real_envido: '¡Real Envido!',
        falta_envido: '¡Falta Envido!',
        envido_envido: '¡Envido!'
      };

      addLog(`${pName}: ${callLabels[callType]}`, 'canto');
      break;
    }

    // ----------------------------------------------------
    // FLOR CALLS
    // ----------------------------------------------------
    case 'CALL_FLOR':
    case 'CALL_CONTRAFLOR':
    case 'CALL_CONTRAFLOR_AL_RESTO': {
      const florType: FlorCallType =
        action.type === 'CALL_FLOR'
          ? 'flor'
          : action.type === 'CALL_CONTRAFLOR'
          ? 'contraflor'
          : 'contraflor_al_resto';

      state.flor.history.push(florType);
      state.flor.currentCall = florType;
      state.flor.caller = player;
      state.flor.challengedPlayer = other;

      if (florType === 'flor') {
        addLog(`${pName}: ¡Flor!`, 'canto');
        // If other player doesn't have flor, immediately award 3 points
        const otherAllCards = state.hands[other].concat(state.playedCards[other]);
        if (!hasFlor(otherAllCards)) {
          state.score[player] += 3;
          state.flor.isResolved = true;
          state.envido.isResolved = true; // Flor cancels envido
          addLog(`${pName} suma 3 puntos de Flor.`, 'score');
          state.phase = 'waiting_action';
          // Turn returns to whose turn it was
          state.turn = state.tricks[state.currentTrickIndex].cards.length === 0 ? state.mano : other;
          checkMatchWinner();
        } else {
          // Other player also has flor, wait for their call
          state.phase = 'flor_pending';
          state.turn = other;
        }
      } else {
        addLog(`${pName}: ¡${florType === 'contraflor' ? 'Contraflor' : 'Contraflor al Resto'}!`, 'canto');
        state.phase = 'flor_pending';
        state.turn = other;
      }
      break;
    }

    // ----------------------------------------------------
    // TRUCO CALLS
    // ----------------------------------------------------
    case 'CALL_TRUCO':
    case 'CALL_RETRUCO':
    case 'CALL_VALE_CUATRO': {
      const level: TrucoBetLevel =
        action.type === 'CALL_TRUCO'
          ? 'truco'
          : action.type === 'CALL_RETRUCO'
          ? 'retruco'
          : 'vale_cuatro';

      state.truco.pendingLevel = level;
      state.truco.caller = player;
      state.truco.challengedPlayer = other;
      state.phase = 'truco_pending';
      state.turn = other;

      const labels: Record<TrucoBetLevel, string> = {
        none: '',
        truco: '¡Truco!',
        retruco: '¡Quiero Re-Truco!',
        vale_cuatro: '¡Quiero Vale Cuatro!'
      };

      addLog(`${pName}: ${labels[level]}`, 'canto');
      break;
    }

    // ----------------------------------------------------
    // QUIERO
    // ----------------------------------------------------
    case 'QUIERO': {
      addLog(`${pName}: ¡Quiero!`, 'canto');

      if (state.phase === 'envido_pending') {
        const stakes = getEnvidoStakes(state.envido.history, state.score, state.config.maxScore);
        const p1AllCards = state.hands.p1.concat(state.playedCards.p1);
        const p2AllCards = state.hands.p2.concat(state.playedCards.p2);
        const res = compareEnvido(p1AllCards, p2AllCards, state.mano);

        state.score[res.winner] += stakes.acceptedPoints;
        state.envido.isResolved = true;
        state.envido.winner = res.winner;
        state.envido.pointsAwarded = stakes.acceptedPoints;

        const wName = res.winner === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
        addLog(
          `Envido: ${state.config.p1Name || 'P1'} (${res.p1Points}) vs ${state.config.p2Name || 'P2'} (${res.p2Points}). Gana ${wName} (+${stakes.acceptedPoints} pts).`,
          'score'
        );

        if (!checkMatchWinner()) {
          // Resume flow: if truco was pending before envido, return to truco response; else waiting_action
          if (state.truco.pendingLevel) {
            state.phase = 'truco_pending';
            state.turn = state.truco.challengedPlayer!;
          } else {
            state.phase = 'waiting_action';
            // Turn goes back to whose turn it was to play a card
            const currentTrick = state.tricks[state.currentTrickIndex];
            state.turn = currentTrick.cards.length === 0 ? state.mano : getOtherPlayer(currentTrick.cards[0].player);
          }
        }
      } else if (state.phase === 'flor_pending') {
        const stakes = getFlorStakes(state.flor.history, state.score, state.config.maxScore);
        const p1AllCards = state.hands.p1.concat(state.playedCards.p1);
        const p2AllCards = state.hands.p2.concat(state.playedCards.p2);
        const res = compareFlor(p1AllCards, p2AllCards, state.mano);

        state.score[res.winner] += stakes.acceptedPoints;
        state.flor.isResolved = true;
        state.flor.winner = res.winner;
        state.flor.pointsAwarded = stakes.acceptedPoints;
        state.envido.isResolved = true;

        const wName = res.winner === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
        addLog(`Flor: ${wName} gana con ${res.winner === 'p1' ? res.p1Points : res.p2Points} (+${stakes.acceptedPoints} pts).`, 'score');

        if (!checkMatchWinner()) {
          state.phase = 'waiting_action';
          const currentTrick = state.tricks[state.currentTrickIndex];
          state.turn = currentTrick.cards.length === 0 ? state.mano : getOtherPlayer(currentTrick.cards[0].player);
        }
      } else if (state.phase === 'truco_pending') {
        state.truco.currentLevel = state.truco.pendingLevel!;
        state.truco.lastAcceptedBy = player;
        state.truco.pendingLevel = null;
        state.truco.challengedPlayer = null;
        state.phase = 'waiting_action';

        // Turn returns to the player whose turn it was to play card (or caller if responding)
        const currentTrick = state.tricks[state.currentTrickIndex];
        if (currentTrick.cards.length === 0) {
          state.turn = state.mano;
        } else {
          state.turn = getOtherPlayer(currentTrick.cards[0].player);
        }
      }
      break;
    }

    // ----------------------------------------------------
    // NO QUIERO
    // ----------------------------------------------------
    case 'NO_QUIERO': {
      addLog(`${pName}: No quiero.`, 'canto');

      if (state.phase === 'envido_pending') {
        const stakes = getEnvidoStakes(state.envido.history, state.score, state.config.maxScore);
        const winner = other;
        state.score[winner] += stakes.declinedPoints;
        state.envido.isResolved = true;
        state.envido.winner = winner;
        state.envido.pointsAwarded = stakes.declinedPoints;

        addLog(`${oName} suma ${stakes.declinedPoints} punto(s) de Envido no querido.`, 'score');

        if (!checkMatchWinner()) {
          if (state.truco.pendingLevel) {
            state.phase = 'truco_pending';
            state.turn = state.truco.challengedPlayer!;
          } else {
            state.phase = 'waiting_action';
            const currentTrick = state.tricks[state.currentTrickIndex];
            state.turn = currentTrick.cards.length === 0 ? state.mano : getOtherPlayer(currentTrick.cards[0].player);
          }
        }
      } else if (state.phase === 'flor_pending') {
        const stakes = getFlorStakes(state.flor.history, state.score, state.config.maxScore);
        const winner = other;
        state.score[winner] += stakes.declinedPoints;
        state.flor.isResolved = true;
        state.envido.isResolved = true;

        addLog(`${oName} suma ${stakes.declinedPoints} punto(s) de Flor no querida.`, 'score');

        if (!checkMatchWinner()) {
          state.phase = 'waiting_action';
          const currentTrick = state.tricks[state.currentTrickIndex];
          state.turn = currentTrick.cards.length === 0 ? state.mano : getOtherPlayer(currentTrick.cards[0].player);
        }
      } else if (state.phase === 'truco_pending') {
        // Declining Truco gives points of previous level (or 1 for truco, 2 for retruco, 3 for vale 4)
        let points = 1;
        if (state.truco.pendingLevel === 'retruco') points = 2;
        if (state.truco.pendingLevel === 'vale_cuatro') points = 3;

        state.score[other] += points;
        state.handWinner = other;
        state.phase = 'hand_ended';
        addLog(`${oName} gana la mano (+${points} pts por Truco rechazado).`, 'score');
        checkMatchWinner();
      }
      break;
    }

    // ----------------------------------------------------
    // PLAY CARD
    // ----------------------------------------------------
    case 'PLAY_CARD': {
      if (!action.card) throw new Error('Card is required for PLAY_CARD action');
      const cardIndex = state.hands[player].findIndex(c => c.id === action.card!.id);
      if (cardIndex === -1) throw new Error('Player does not possess this card');

      // Remove card from hand and add to played cards & trick
      const rawCard = state.hands[player].splice(cardIndex, 1)[0];
      const playedCard = action.isCovered ? { ...rawCard, isCovered: true } : rawCard;
      state.playedCards[player].push(playedCard);

      const currentTrick = state.tricks[state.currentTrickIndex];
      currentTrick.cards.push({ player, card: playedCard, isCovered: action.isCovered });

      addLog(`${pName} juega ${formatCardName(playedCard)}.`, 'play');

      // If trick 1 card 1 is played, envido is closed for this hand if not already called
      if (state.currentTrickIndex === 0 && currentTrick.cards.length === 2 && !state.envido.isResolved) {
        state.envido.isResolved = true; // Envido expired
      }

      if (currentTrick.cards.length === 1) {
        // Wait for other player's card
        state.turn = other;
      } else if (currentTrick.cards.length === 2) {
        // Resolve Trick
        const cardA = currentTrick.cards[0].card;
        const cardB = currentTrick.cards[1].card;
        const playerA = currentTrick.cards[0].player;
        const playerB = currentTrick.cards[1].player;

        const cmp = compareCards(cardA, cardB);
        let trickWinner: TrickWinner;
        if (cmp > 0) {
          trickWinner = playerA;
        } else if (cmp < 0) {
          trickWinner = playerB;
        } else {
          trickWinner = 'parda';
        }
        (currentTrick as { winner?: TrickWinner }).winner = trickWinner;

        if (trickWinner === 'parda') {
          addLog(`Parda en la ${currentTrick.number}ª mano.`, 'info');
        } else {
          const twName = trickWinner === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
          addLog(`${twName} gana la ${currentTrick.number}ª mano.`, 'info');
        }

        // Check if hand is resolved
        const handOutcome = evaluateHandWinner(state);
        if (handOutcome !== null) {
          state.handWinner = handOutcome;
          state.phase = 'hand_ended';

          // Award Truco points
          let trucoPoints = 1;
          if (state.truco.currentLevel === 'truco') trucoPoints = 2;
          if (state.truco.currentLevel === 'retruco') trucoPoints = 3;
          if (state.truco.currentLevel === 'vale_cuatro') trucoPoints = 4;

          state.score[handOutcome] += trucoPoints;
          const hwName = handOutcome === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
          addLog(`¡${hwName} gana la mano! (+${trucoPoints} pts).`, 'score');
          checkMatchWinner();
        } else {
          // Hand continues to next trick
          state.currentTrickIndex++;
          // Next trick leader:
          if (trickWinner === 'parda') {
            // Next leader after parda is the player who led the parda trick (or Mano in trick 1)
            state.turn = playerA;
          } else {
            state.turn = trickWinner;
          }
        }
      }
      break;
    }

    // ----------------------------------------------------
    // IRSE AL MAZO (FOLD)
    // ----------------------------------------------------
    case 'IRSE_AL_MAZO': {
      addLog(`${pName} se va al mazo.`, 'canto');

      // Envido points if not resolved yet and folded in first hand or during challenge
      if (!state.envido.isResolved && state.currentTrickIndex === 0) {
        let envidoPts = 1;
        if (state.phase === 'envido_pending' && state.envido.history.length > 0) {
          const stakes = getEnvidoStakes(state.envido.history, state.score, state.config.maxScore);
          envidoPts = stakes.declinedPoints;
        }
        state.score[other] += envidoPts;
        state.envido.isResolved = true;
        addLog(`${oName} suma ${envidoPts} punto(s) de Envido.`, 'score');
      }

      // Truco points to other player
      let trucoPoints = 1;
      if (state.truco.currentLevel === 'truco') trucoPoints = 2;
      if (state.truco.currentLevel === 'retruco') trucoPoints = 3;
      if (state.truco.currentLevel === 'vale_cuatro') trucoPoints = 4;

      // If folded during a challenge, award the previous level (or 1)
      if (state.phase === 'truco_pending') {
        if (state.truco.pendingLevel === 'truco') trucoPoints = 1;
        else if (state.truco.pendingLevel === 'retruco') trucoPoints = 2;
        else if (state.truco.pendingLevel === 'vale_cuatro') trucoPoints = 3;
      }

      state.score[other] += trucoPoints;
      state.handWinner = other;
      state.phase = 'hand_ended';
      addLog(`${oName} gana la mano (+${trucoPoints} pts).`, 'score');
      checkMatchWinner();
      break;
    }
  }

  return state;
}

export function evaluateHandWinner(state: GameState): PlayerId | null {
  const t1 = state.tricks[0]?.winner;
  const t2 = state.tricks[1]?.winner;
  const t3 = state.tricks[2]?.winner;

  if (!t1) return null;

  // Case 1: After Trick 2
  if (t2) {
    // 2-0 win
    if (t1 === 'p1' && t2 === 'p1') return 'p1';
    if (t1 === 'p2' && t2 === 'p2') return 'p2';

    // 1st trick Parda -> winner of 2nd trick wins
    if (t1 === 'parda' && t2 === 'p1') return 'p1';
    if (t1 === 'parda' && t2 === 'p2') return 'p2';

    // 2nd trick Parda -> winner of 1st trick wins
    if (t1 === 'p1' && t2 === 'parda') return 'p1';
    if (t1 === 'p2' && t2 === 'parda') return 'p2';

    // If 1-1 split or double parda, we need Trick 3
  }

  // Case 2: After Trick 3
  if (t3) {
    if (t3 === 'p1') return 'p1';
    if (t3 === 'p2') return 'p2';

    if (t3 === 'parda') {
      // 3rd trick parda: winner of 1st trick wins
      if (t1 === 'p1') return 'p1';
      if (t1 === 'p2') return 'p2';

      // Triple parda: Mano wins
      if (t1 === 'parda' && t2 === 'parda') {
        return state.mano;
      }
    }
  }

  return null;
}

export function startNextHand(currentState: GameState, deckProvider?: () => Card[]): GameState {
  if (currentState.phase !== 'hand_ended') {
    throw new Error('Cannot start next hand when hand is not ended');
  }

  const nextDealer = getOtherPlayer(currentState.dealer);
  const nextMano = getOtherPlayer(currentState.mano);
  const deck = deckProvider ? deckProvider() : shuffleDeck(createDeck());

  const p1Cards = [deck[0], deck[2], deck[4]];
  const p2Cards = [deck[1], deck[3], deck[5]];

  const state: GameState = {
    ...currentState,
    handNumber: currentState.handNumber + 1,
    dealer: nextDealer,
    mano: nextMano,
    turn: nextMano,
    phase: 'waiting_action',
    hands: {
      p1: p1Cards,
      p2: p2Cards
    },
    playedCards: {
      p1: [],
      p2: []
    },
    tricks: [
      { number: 1, cards: [] },
      { number: 2, cards: [] },
      { number: 3, cards: [] }
    ],
    currentTrickIndex: 0,
    envido: {
      isResolved: false,
      history: [],
      currentCall: null,
      caller: null,
      challengedPlayer: null,
      acceptedValue: 0,
      declinedValue: 0
    },
    flor: {
      isResolved: false,
      history: [],
      currentCall: null,
      caller: null,
      challengedPlayer: null,
      acceptedValue: 0,
      declinedValue: 0
    },
    truco: {
      currentLevel: 'none',
      caller: null,
      challengedPlayer: null,
      pendingLevel: null,
      lastAcceptedBy: null
    },
    handWinner: null
  };

  const manoName = nextMano === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
  state.logs.push({ text: `--- Mano #${state.handNumber} --- Mano: ${manoName}`, type: 'info' });

  return state;
}
