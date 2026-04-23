import {
  LoveletterState,
  PublicLoveletterState,
} from '../../shared/types/GameState';
import { PublicPlayerState } from '../../shared/types/Player';

/**
 * Playerを安全に公開用へ変換
 */
export function toPublicPlayer(
  player: LoveletterState['players'][number],
  viewerId: string,
): PublicPlayerState {
  const base = {
    id: player.id,
    name: player.name,
    discardPile: player.discardPile,
    isEliminated: player.isEliminated,
    eliminatedCount: player.eliminatedCount,
    isProtected: player.isProtected,
    point: player.point,
  } satisfies Omit<PublicPlayerState, 'hand' | 'drawnCard'>;

  return {
    ...base,
    // 自分だけ手札が見える
    hand:
      player.id === viewerId && player.hand !== null ? player.hand : undefined,

    drawnCard:
      player.id === viewerId && player.drawnCard !== null
        ? player.drawnCard
        : undefined,
  };
}

/**
 * GameStateを安全に公開用へ変換
 */
export function getPublicState(
  state: LoveletterState,
  viewerId: string,
): PublicLoveletterState {
  const base = {
    currentPlayer: state.currentPlayer,
    roundStartPlayer: state.roundStartPlayer,

    isGameEnded: state.isGameEnded,
    turn: state.turn,

    round: state.round,
    roundWinners: state.roundWinners,
    point: state.point,
    winPointCondition: state.winPointCondition,

    winnerId: state.winnerId,
    winnerName: state.winnerName,

    revealedCards: state.revealedCards,

    pendingEffect: state.pendingEffect,

    phase: state.phase,
  } satisfies Omit<PublicLoveletterState, 'players' | 'deckCount'>;

  return {
    ...base,
    players: state.players.map((p) => toPublicPlayer(p, viewerId)),

    // 中身は見せない
    deckCount: state.deck.length,
  };
}
