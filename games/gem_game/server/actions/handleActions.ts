import { GemGameState } from '../../shared/types';
import { buyCard } from './buyCard';
import { checkNobles } from './checkNobles';
import { endTurn, getWinner, isGameEnded } from './endTurn';
import { reserveCard, reserveFromDeck } from './reserveCard';
import { takeDifferentTokens } from './takeDifferentTokens';
import { takeSameTokens } from './takeSameTokens';

export function handleTakeTokens(state: GemGameState, payload: any) {
  if (payload.tokens.length === 2) {
    return takeSameTokens(state, {
      color: payload.tokens[0],
    });
  }

  if (payload.tokens.length === 3) {
    return takeDifferentTokens(state, {
      colors: payload.tokens,
    });
  }

  throw new Error('INVALID_TOKEN_SELECTION');
}

export function handleReserveCard(state: GemGameState, payload: any) {
  switch (payload.source) {
    case 'market':
      return reserveCard(state, {
        cardId: payload.cardId,
      });

    case 'deck':
      return reserveFromDeck(state, {
        level: payload.level,
      });

    default:
      throw new Error('INVALID_RESERVE_TYPE');
  }
}

export function handleBuyCard(state: GemGameState, payload: any) {
  return buyCard(state, payload);
}

export function runGameFlow(state: GemGameState) {
  checkNobles(state);

  endTurn(state);

  if (isGameEnded(state)) {
    const winner = getWinner(state);

    if (winner) {
      state.winnerId = winner.id;
      state.winnerName = winner.name;
      state.roundEndTriggered = true;
    }
  }
}
