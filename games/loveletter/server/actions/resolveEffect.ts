import { LoveletterState, CardType } from 'games/loveletter/shared/types';
import getCurrentUser from '../utils/getCurrentUser';
import { getCardValue } from './getCardValue';
import { GameError } from '../../shared/types';

/**
 * draw時のアクションを発動
 */
export function resolveDrawEffect(state: LoveletterState): {
  state: LoveletterState;
  eliminationReason?: CardType;
} {
  const player = getCurrentUser(state);
  if (!player) return { state };

  let eliminationReason: CardType | undefined;

  const drawn = player.drawnCard;

  if (!drawn) return { state };

  switch (drawn.type) {
    case 'KING_FATAL':
      player.isEliminated = true;
      eliminationReason = 'KING_FATAL';
      break;

    default:
      // MINISTER判定（手札 or 引いたカードのどちらかがMINISTERなら発動）
      if (
        (player.hand?.type === 'MINISTER' || drawn.type === 'MINISTER') &&
        player.hand &&
        player.drawnCard
      ) {
        const total =
          getCardValue(player.hand, player) +
          getCardValue(player.drawnCard, player);

        if (total >= 12) {
          player.isEliminated = true;
          eliminationReason = 'MINISTER';
        }
      }
      break;
  }

  return { state, eliminationReason };
}

/**
 * プレイ時の効果を解決を発動
 */
export function resolvePlayEffect(
  state: LoveletterState,
  cardType: CardType,
  // アクションの効果を受けるプレイヤー
  targetPlayerId?: string,
  guess?: CardType,
): { state: LoveletterState; eliminationReason?: CardType } {
  const player = getCurrentUser(state);
  if (!player) return { state };

  let eliminationReason: CardType | undefined;

  const requiresTarget = [
    'SOLDIER',
    'CLOWN',
    'KNIGHT',
    'WIZARD',
    'GENERAL',
    'MERCHANT',
    'SCHOLAR',
    'SERVANT',
  ];

  const validTargets = state.players.filter((p) => {
    if (p.isEliminated || p.isProtected) return false;

    // WIZARDは自分も対象にできる
    if (cardType === 'WIZARD') {
      return true;
    }

    return p.id !== player.id;
  });

  if (requiresTarget.includes(cardType) && validTargets.length === 0) {
    return { state };
  }

  const target = state.players.find((p) => p.id === targetPlayerId);

  switch (cardType) {
    // --- PLAY時カード ---
    case 'SOLDIER':
      if (target && guess && target.hand?.type === guess) {
        target.isEliminated = true;
        eliminationReason = 'SOLDIER';
      }
      break;

    case 'CLOWN':
      // 対象の手札を一時的に公開（viewer限定）
      if (target && target.hand) {
        (state as any).pendingEffect = {
          type: 'REVEAL',
          viewerId: player.id,
          targetId: target.id,
          card: target.hand,
        };
      }
      break;

    case 'KNIGHT': {
      const myCardK = player.hand ?? player.drawnCard;
      const targetCardK = target?.hand;

      if (target && targetCardK && myCardK) {
        state.pendingEffect = {
          type: 'BATTLE',
          attackerId: player.id,
          targetId: target.id,
          myCard: myCardK,
          targetCard: targetCardK,
          rule: 'LOWER_LOSES', // 小さい方が脱落
        };
      }
      break;
    }

    case 'PRIEST':
      player.isProtected = true;
      break;

    case 'WIZARD':
      if (target) {
        state.pendingEffect = {
          type: 'WIZARD',
          playerId: player.id,
          targetId: target.id,
        };
      }
      break;

    case 'GENERAL':
      if (target && target.hand && player.hand) {
        state.pendingEffect = {
          type: 'EXCHANGE',
          playerId: player.id,
          targetId: target.id,
        };
      }
      break;

    case 'PRINCESS':
      player.isEliminated = true;
      eliminationReason = 'PRINCESS';
      break;

    // --- PLAY追加カード ---
    case 'COMMONER':
      // 終了時処理なのでここでは何もしない
      break;

    case 'SERVANT':
      if (target && player.hand && target.hand) {
        state.pendingEffect = {
          type: 'EXCHANGE',
          playerId: player.id,
          targetId: target.id,
        };
      }
      break;

    case 'FORTUNE_TELLER':
      if (state.deck.length > 0 && player.hand) {
        const top = state.deck[state.deck.length - 1];
        const temp = player.hand;
        player.hand = top;
        state.deck[state.deck.length - 1] = temp;
      }
      break;

    case 'MERCHANT':
      if (target?.hand && getCardValue(target.hand, target) <= 3) {
        target.isEliminated = true;
        eliminationReason = 'MERCHANT';
      }
      break;

    case 'BUTLER':
      break;

    case 'SCHOLAR': {
      const myCardS = player.hand ?? player.drawnCard;
      const targetCardS = target?.hand;

      if (target && targetCardS && myCardS) {
        state.pendingEffect = {
          type: 'BATTLE',
          attackerId: player.id,
          targetId: target.id,
          myCard: myCardS,
          targetCard: targetCardS,
          rule: 'HIGHER_LOSES', // 大きい方が脱落
        };
      }
      break;
    }

    case 'DOG':
      throw new GameError('CAN_NOT_TAKE_CARD', 'このカードは出せないです');

    case 'MARQUISE':
      // 強制プレイはPLAY時に制御
      break;

    case 'COUNTESS':
      throw new GameError('CAN_NOT_TAKE_CARD', 'このカードは出せないです');

    case 'PRINCESS_SECOND':
      // 復帰はELIMINATE処理側で対応
      break;

    case 'PRINCESS_THIRD':
      player.isEliminated = true;
      eliminationReason = 'PRINCESS_THIRD';
      state.isGameEnded = true;
      break;

    case 'PRINCE':
      player.isEliminated = true;
      eliminationReason = 'PRINCE';
      break;
  }

  return { state, eliminationReason };
}

/**
 * 状態管理
 */
export function resolvePassiveEffect(state: LoveletterState): {
  state: LoveletterState;
  eliminationReason?: CardType;
} {
  let eliminationReason: CardType | undefined;

  state.players.forEach((player) => {
    if (player.isEliminated) return;

    // 王太后（捨て札合計5以上で脱落）
    if (player.hand?.type === 'QUEEN_MOTHER') {
      const sum = player.discardPile.reduce(
        (acc, c) => acc + getCardValue(c, player),
        0,
      );
      if (sum >= 5) {
        player.isEliminated = true;
        eliminationReason = 'QUEEN_MOTHER';
      }
    }
  });

  return { state, eliminationReason };
}
