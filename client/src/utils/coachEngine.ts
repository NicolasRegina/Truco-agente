import {
  ActionType,
  calculateEnvido,
  Card,
  GameState,
  getAvailableActions,
  hasFlor,
  PlayerId
} from '@truco/core';

export interface CoachAdvice {
  recommendedAction?: ActionType;
  recommendedCardId?: string;
  badge: string;
  title: string;
  explanation: string;
}

export function getCoachAdvice(state: GameState, player: PlayerId): CoachAdvice | null {
  const hand = state.hands[player] || [];
  if (hand.length === 0) return null;
  // If player's hand contains hidden placeholder cards, coach cannot advise
  if (hand.some(c => c.id?.startsWith('hidden'))) return null;

  const allPlayerCards = hand.concat(state.playedCards[player] || []);
  const envidoPts = calculateEnvido(allPlayerCards);
  const playerHasFlor = state.config.withFlor && hasFlor(allPlayerCards);

  // 1. Envido is pending (Opponent called Envido/Real Envido/Falta Envido)
  if (state.phase === 'envido_pending') {
    const currentCall = state.envido.currentCall;
    const history = state.envido.history;
    const lastCall = history[history.length - 1];

    if (playerHasFlor) {
      return {
        recommendedAction: 'CALL_FLOR',
        badge: 'Flor Salva',
        title: '¡Cantá Flor!',
        explanation: 'La Flor anula el Envido y suma 3 puntos para vos.'
      };
    }

    if (lastCall === 'falta_envido' || currentCall === 'falta_envido') {
      if (envidoPts >= 31) {
        return {
          recommendedAction: 'QUIERO',
          badge: 'Gran Tanto',
          title: '¡Quiero!',
          explanation: `Tenés ${envidoPts} de tanto. Es un puntaje muy alto para pelear la Falta.`
        };
      }
      return {
        recommendedAction: 'NO_QUIERO',
        badge: 'Prudencia',
        title: 'No Quiero',
        explanation: `Con ${envidoPts} puntos es arriesgado aceptar la Falta Envido.`
      };
    }

    if (lastCall === 'real_envido' || currentCall === 'real_envido') {
      if (envidoPts >= 29) {
        return {
          recommendedAction: 'QUIERO',
          badge: 'Buen Tanto',
          title: '¡Quiero!',
          explanation: `Con ${envidoPts} puntos tenés excelentes chances de ganar el Real Envido.`
        };
      }
      return {
        recommendedAction: 'NO_QUIERO',
        badge: 'Cuidar Puntos',
        title: 'No Quiero',
        explanation: `Con ${envidoPts} puntos es preferible no arriesgar 3 puntos.`
      };
    }

    // Standard Envido (2 pts)
    if (envidoPts >= 27) {
      if (envidoPts >= 32) {
        return {
          recommendedAction: 'CALL_REAL_ENVIDO',
          badge: 'Redoblar',
          title: '¡Real Envido!',
          explanation: `Tenés un excelente tanto (${envidoPts} pts). ¡Aumentá la apuesta a Real Envido!`
        };
      }
      return {
        recommendedAction: 'QUIERO',
        badge: 'Buen Tanto',
        title: '¡Quiero!',
        explanation: `Tenés ${envidoPts} puntos. Son buenos puntos para aceptar el Envido.`
      };
    }

    return {
      recommendedAction: 'NO_QUIERO',
      badge: 'Bajo Tanto',
      title: 'No Quiero',
      explanation: `Tenés solo ${envidoPts} puntos. Mejor no arriesgar puntos de tanto.`
    };
  }

  // 2. Truco is pending (Opponent called Truco / Retruco / Vale Cuatro)
  if (state.phase === 'truco_pending') {
    const lostFirstTrick = state.tricks[0]?.winner && state.tricks[0]?.winner !== player && state.tricks[0]?.winner !== 'parda';

    // If opponent called Truco before Envido was resolved, reminder "El envido está primero"
    if (state.currentTrickIndex === 0 && !state.envido.isResolved && envidoPts >= 28) {
      return {
        recommendedAction: 'CALL_ENVIDO',
        badge: 'El Envido va primero',
        title: '¡Cantá Envido!',
        explanation: `Por ley del Truco, el Envido va antes. Tenés ${envidoPts} de tanto para aprovechar.`
      };
    }

    if (lostFirstTrick) {
      return {
        recommendedAction: 'NO_QUIERO',
        badge: 'Cuidar Puntos',
        title: 'No Quiero',
        explanation: 'Perdiste la primera y tus cartas son bajas. Mejor entregar 1 punto.'
      };
    }

    return {
      recommendedAction: 'QUIERO',
      badge: 'Pelea la Mano',
      title: 'Quiero',
      explanation: 'La mano está abierta, confiá en tu juego.'
    };
  }

  // 3. Normal turn (Waiting action: can play card, call Envido, Flor or Truco)
  if (state.phase === 'waiting_action') {
    const availableActions = getAvailableActions(state, player);

    // A) If trick 0 and Envido is still open and available to execute
    if (state.currentTrickIndex === 0 && !state.envido.isResolved && state.envido.history.length === 0) {
      if (playerHasFlor && availableActions.includes('CALL_FLOR')) {
        return {
          recommendedAction: 'CALL_FLOR',
          badge: '¡Flor Criolla!',
          title: '¡Cantá Flor!',
          explanation: 'Tenés tres cartas del mismo palo. ¡Cantá Flor antes de tirar carta!'
        };
      }

      if (envidoPts >= 28 && availableActions.includes('CALL_ENVIDO')) {
        return {
          recommendedAction: 'CALL_ENVIDO',
          badge: 'Buen Envido',
          title: '¡Cantá Envido primero!',
          explanation: `Tenés ${envidoPts} puntos de tanto. Si tirás carta sin cantar, perdés la oportunidad.`
        };
      }
    }

    // B) Card recommendation
    const currentTrick = state.tricks[state.currentTrickIndex];
    const opponentCard = currentTrick?.cards.find(c => c.player !== player)?.card;

    // Sort player's cards from lowest to highest rank
    const sortedCards = [...hand].sort((a, b) => a.rank - b.rank);

    const formatCardLabel = (c: Card) => {
      const suitName = c.suit.charAt(0).toUpperCase() + c.suit.slice(1);
      return `${c.value} de ${suitName}`;
    };

    // Case B1: Player is playing SECOND in this trick (Opponent already played a card)
    if (opponentCard) {
      // Find the lowest card that beats the opponent's card
      const winningCard = sortedCards.find(c => c.rank > opponentCard.rank);
      const tieCard = sortedCards.find(c => c.rank === opponentCard.rank);

      if (winningCard) {
        if (state.currentTrickIndex === 2) {
          return {
            recommendedCardId: winningCard.id,
            badge: 'Definir Mano',
            title: `¡Matá con el ${formatCardLabel(winningCard)}!`,
            explanation: `Superás el ${formatCardLabel(opponentCard)} del rival y te llevás la mano definitiva.`
          };
        }

        return {
          recommendedCardId: winningCard.id,
          badge: 'Ganar Mano',
          title: `Matá con el ${formatCardLabel(winningCard)}`,
          explanation: `Jugá tu ${formatCardLabel(winningCard)} para superar el ${formatCardLabel(opponentCard)} del rival con la carta más justa.`
        };
      }

      if (tieCard && state.currentTrickIndex === 0) {
        return {
          recommendedCardId: tieCard.id,
          badge: 'Pardar',
          title: `Empardá con el ${formatCardLabel(tieCard)}`,
          explanation: 'Pardar en primera beneficia a quien es mano para definir en segunda.'
        };
      }

      // Cannot win:
      const lowestCard = sortedCards[0];

      // If it's trick 3 (last trick of the hand):
      if (state.currentTrickIndex === 2) {
        return {
          recommendedCardId: lowestCard.id,
          badge: 'Última Carta',
          title: `Jugá el ${formatCardLabel(lowestCard)}`,
          explanation: `No alcanza para superar el ${formatCardLabel(opponentCard)} del rival. Es tu última carta para cerrar la mano.`
        };
      }

      // If earlier tricks with cards left:
      if (sortedCards.length > 1) {
        return {
          recommendedCardId: lowestCard.id,
          badge: 'Descarte',
          title: `Quemá el ${formatCardLabel(lowestCard)}`,
          explanation: `No podés matar el ${formatCardLabel(opponentCard)}. Tirale tu carta más baja y guardate las mejores para después.`
        };
      }

      return {
        recommendedCardId: lowestCard.id,
        badge: 'Completar Ronda',
        title: `Tirá el ${formatCardLabel(lowestCard)}`,
        explanation: `No podés matar el ${formatCardLabel(opponentCard)}. Jugá tu carta para completar la ronda.`
      };
    }

    // Case B2: Player is playing FIRST in this trick
    if (state.currentTrickIndex === 0) {
      // First trick of the hand
      const highestCard = sortedCards[sortedCards.length - 1];

      // If we have a very strong card, lead with something medium or high to secure 1st
      if (sortedCards.length >= 2 && sortedCards[1].rank >= 9) {
        const midCard = sortedCards[1];
        return {
          recommendedCardId: midCard.id,
          badge: 'Salida Estratégica',
          title: `Salí con el ${formatCardLabel(midCard)}`,
          explanation: `Iniciá la ronda con el ${formatCardLabel(midCard)} para sondear al rival sin quemar tu carta más alta.`
        };
      }

      return {
        recommendedCardId: highestCard.id,
        badge: 'Asegurar Primera',
        title: `Salí con el ${formatCardLabel(highestCard)}`,
        explanation: 'En el Truco, "primera mano vale doble". Buscá ganar la primera ronda.'
      };
    }

    if (state.currentTrickIndex === 1) {
      const wonTrick0 = state.tricks[0]?.winner === player;
      if (wonTrick0) {
        // If won 1st, play highest to win the match right here!
        const highestCard = sortedCards[sortedCards.length - 1];
        return {
          recommendedCardId: highestCard.id,
          badge: 'Definir Partida',
          title: `¡Rematá con el ${formatCardLabel(highestCard)}!`,
          explanation: 'Ganaste la primera. Si ganás esta mano, te llevás todos los puntos del Truco.'
        };
      }
      // Lost trick 0: must win trick 1!
      const highestCard = sortedCards[sortedCards.length - 1];
      return {
        recommendedCardId: highestCard.id,
        badge: 'Obligado a Ganar',
        title: `Tirá tu mejor carta (${formatCardLabel(highestCard)})`,
        explanation: 'Tenés que ganar esta ronda sí o sí para forzar la tercera mano.'
      };
    }

    // Trick 2 (Tercera / Definición)
    const finalCard = sortedCards[0];
    return {
      recommendedCardId: finalCard.id,
      badge: 'Definición Final',
      title: `Tirá el ${formatCardLabel(finalCard)}`,
      explanation: '¡Todo se define acá! Tirá tu última carta con fe.'
    };
  }

  return null;
}
