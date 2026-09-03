import {
  ActionType,
  calculateEnvido,
  GameState,
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

  const envidoPts = calculateEnvido(hand);
  const playerHasFlor = state.config.withFlor && hasFlor(hand);

  // 1. Envido is pending (Opponent called Envido/Real Envido/Falta Envido)
  if (state.phase === 'envido_pending') {
    const currentCall = state.envido.currentCall;

    if (currentCall === 'falta_envido') {
      if (envidoPts >= 31) {
        return {
          recommendedAction: 'QUIERO',
          badge: 'Envido Decisivo',
          title: '¡Aceptá la Falta Envido!',
          explanation: `Tenés ${envidoPts} puntos, un tanto casi imbatible para definir el juego.`
        };
      }
      return {
        recommendedAction: 'NO_QUIERO',
        badge: 'Prudencia Criolla',
        title: 'No Quiero la Falta',
        explanation: `Con ${envidoPts} puntos es muy riesgoso apostar la partida entera.`
      };
    }

    if (envidoPts >= 29) {
      if (envidoPts >= 32 && currentCall === 'envido') {
        return {
          recommendedAction: 'CALL_REAL_ENVIDO',
          badge: 'Tanto Gigante',
          title: '¡Subí a Real Envido!',
          explanation: `¡Tenés ${envidoPts} de tanto! Subile la apuesta para sacarle más puntos.`
        };
      }
      return {
        recommendedAction: 'QUIERO',
        badge: 'Buen Tanto',
        title: '¡Quiero!',
        explanation: `Tenés ${envidoPts} puntos de envido. Tenés muy buenas chances de ganar.`
      };
    }

    if (envidoPts <= 26) {
      return {
        recommendedAction: 'NO_QUIERO',
        badge: 'Retirada a Tiempo',
        title: 'No Quiero',
        explanation: `Con ${envidoPts} puntos es preferible ceder 1 punto que perder 2.`
      };
    }

    // 27 or 28: marginal
    return {
      recommendedAction: 'QUIERO',
      badge: 'Tanto Medio',
      title: 'Quiero (Ajustado)',
      explanation: `Tenés ${envidoPts} puntos. Está parejo, pero vale la pena pelearlo.`
    };
  }

  // 2. Truco is pending (Opponent called Truco / Retruco / Vale Cuatro)
  if (state.phase === 'truco_pending') {
    const sortedRanks = [...hand].map(c => c.rank).sort((a, b) => b - a);
    const highestRank = sortedRanks[0] || 0;
    const wonFirst = state.tricks[0]?.winner === player;

    // Has Macho (14), Hembra (13), 7s (11-12) or 3s (10)
    if (highestRank >= 13 || (wonFirst && highestRank >= 10)) {
      if (highestRank === 14 && state.truco.currentLevel === 'truco') {
        return {
          recommendedAction: 'CALL_RETRUCO',
          badge: 'Poder Máximo',
          title: '¡Retruco!',
          explanation: 'Tenés el As de Espadas ("El Macho"). Apretá con Retruco.'
        };
      }
      return {
        recommendedAction: 'QUIERO',
        badge: 'Mano Fuerte',
        title: '¡Quiero el Truco!',
        explanation: 'Tenés cartas altas suficientes para pelear la mano.'
      };
    }

    // If lost first trick and highest card is weak
    if (state.tricks[0]?.winner && state.tricks[0].winner !== player && highestRank < 9) {
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
    // A) If trick 0 and Envido is still open
    if (state.currentTrickIndex === 0 && !state.envido.isResolved && state.envido.history.length === 0) {
      if (playerHasFlor) {
        return {
          recommendedAction: 'CALL_FLOR',
          badge: '¡Flor Criolla!',
          title: '¡Cantá Flor!',
          explanation: 'Tenés tres cartas del mismo palo. ¡Cantá Flor antes de tirar carta!'
        };
      }

      if (envidoPts >= 28) {
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

    // Case B1: Player is playing SECOND in this trick (Opponent already played a card)
    if (opponentCard) {
      // Find the lowest card that beats the opponent's card
      const winningCard = sortedCards.find(c => c.rank > opponentCard.rank);
      const tieCard = sortedCards.find(c => c.rank === opponentCard.rank);

      if (winningCard) {
        return {
          recommendedCardId: winningCard.id,
          badge: 'Ganar Mano',
          title: `Matá con el ${winningCard.value}`,
          explanation: `Jugá tu ${winningCard.value} para superar el ${opponentCard.value} del rival con la carta más justa.`
        };
      }

      if (tieCard && state.currentTrickIndex === 0) {
        return {
          recommendedCardId: tieCard.id,
          badge: 'Pardar',
          title: `Empardá con el ${tieCard.value}`,
          explanation: 'Pardar en primera beneficia a quien es mano para definir en segunda.'
        };
      }

      // Cannot win: burn the lowest card
      const lowestCard = sortedCards[0];
      return {
        recommendedCardId: lowestCard.id,
        badge: 'Descarte',
        title: `Quemá el ${lowestCard.value}`,
        explanation: `No podés matar el ${opponentCard.value}. Tirale tu carta más baja y guardate las mejores.`
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
          title: `Salí con el ${midCard.value}`,
          explanation: `Iniciá la ronda con el ${midCard.value} para sondear al rival sin quemar tu carta más alta.`
        };
      }

      return {
        recommendedCardId: highestCard.id,
        badge: 'Asegurar Primera',
        title: `Salí con el ${highestCard.value}`,
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
          title: `¡Rematá con el ${highestCard.value}!`,
          explanation: 'Ganaste la primera. Si ganás esta mano, te llevás todos los puntos del Truco.'
        };
      }
      // Lost trick 0: must win trick 1!
      const highestCard = sortedCards[sortedCards.length - 1];
      return {
        recommendedCardId: highestCard.id,
        badge: 'Obligado a Ganar',
        title: `Tirá tu mejor carta (${highestCard.value})`,
        explanation: 'Tenés que ganar esta ronda sí o sí para forzar la tercera mano.'
      };
    }

    // Trick 2 (Tercera / Definición)
    const finalCard = sortedCards[0];
    return {
      recommendedCardId: finalCard.id,
      badge: 'Definición Final',
      title: `Tirá el ${finalCard.value}`,
      explanation: '¡Todo se define acá! Tirá tu última carta con fe.'
    };
  }

  return null;
}
