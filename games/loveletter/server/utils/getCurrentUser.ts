import { LoveletterState, Player } from '../../shared/types';

export default function getCurrentUser(state: LoveletterState): Player {
  const player = state.players.find((p) => p.id === state.currentPlayer);

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  return player;
}
