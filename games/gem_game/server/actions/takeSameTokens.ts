import { GemGameState, Color, GameError } from '../../shared/types';
import getCurrentUser from '../utils/getCurrentUser';

type Params = {
  color: Color;
};

export function takeSameTokens(gameState: GemGameState, params: Params) {
  const { color } = params;

  const player = getCurrentUser(gameState);

  if (!player) {
    return;
  }

  // トークンプール確認
  if (gameState.tokenPool[color] < 4) {
    throw new GameError(
      'NOT_ENOUGH_TOKENS',
      '同じトークンを取得するには4枚以上必要です',
    );
  }

  // トークン10枚制限
  const tokenCount = Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (tokenCount + 2 > 10) {
    throw new GameError(
      'TOKEN_LIMIT_EXCEEDED',
      'トークンは10枚までしか持てません',
    );
  }

  // トークン取得
  gameState.tokenPool[color] -= 2;
  player.tokens[color] += 2;
}

export function takeSameTokensAndReturn(
  gameState: GemGameState,
  params: Params,
): GemGameState {
  takeSameTokens(gameState, params);
  return gameState;
}
