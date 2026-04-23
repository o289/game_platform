// server/src/game/actions/endTurn.ts
import { GemGameState } from '../../shared/types';
import getCurrentUser from '../utils/getCurrentUser';

export function endTurn(gameState: GemGameState) {
  const player = getCurrentUser(gameState);

  if (!player) return;

  // 勝利条件チェック（config対応）
  if (gameState.winCondition.type === 'points') {
    if (player.point >= gameState.winCondition.target) {
      if (!gameState.roundEndTriggered) {
        gameState.roundEndTriggered = true;
        gameState.roundStartPlayer = gameState.currentPlayer;
      }
    }
  }

  // 次プレイヤー
  const currentIndex = gameState.players.findIndex(
    (p) => p.id === gameState.currentPlayer,
  );

  const nextIndex = (currentIndex + 1) % gameState.players.length;

  // ★ここが重要
  const isLastPlayer = currentIndex === gameState.players.length - 1;

  if (isLastPlayer) {
    gameState.turn++;
  }

  gameState.currentPlayer = gameState.players[nextIndex].id;
}

export function isGameEnded(gameState: GemGameState): boolean {
  if (gameState.winCondition.type === 'points') {
    if (!gameState.roundEndTriggered) {
      return false;
    }

    return gameState.currentPlayer === gameState.roundStartPlayer;
  }

  if (gameState.winCondition.type === 'turn_limit') {
    return gameState.turn >= gameState.winCondition.maxTurns;
  }

  return false;
}

export function getWinner(gameState: GemGameState) {
  const players = [...gameState.players];

  if (gameState.winCondition.type === 'points') {
    const target = gameState.winCondition.target;

    // 勝利条件を満たしたプレイヤーを抽出
    const winners = players.filter((p) => p.point >= target);

    if (winners.length === 0) {
      return undefined; // ← ここ重要（誰も達していない）
    }

    // ラウンド終了順で優先（roundStartPlayerから順番）
    const startIndex = players.findIndex(
      (p) => p.id === gameState.roundStartPlayer,
    );

    for (let i = 0; i < players.length; i++) {
      const index = (startIndex + i) % players.length;
      const player = players[index];

      if (player.point >= target) {
        return player;
      }
    }

    return winners[0];
  }

  if (gameState.winCondition.type === 'turn_limit') {
    players.sort((a, b) => b.point - a.point);
    return players[0];
  }

  return undefined;
}
