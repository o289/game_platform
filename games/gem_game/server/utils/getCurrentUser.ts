import { GemGameState, Player } from '../../shared/types';

export default function getCurrentUser(state: GemGameState): Player {
  const player = state.players.find((p) => p.id === state.currentPlayer);

  if (!player) {
    throw new Error('not found');
  }

  return player;
}
