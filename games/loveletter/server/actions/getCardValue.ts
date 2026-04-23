import { Card, Player } from '../../shared/types';

export function getCardValue(card: Card, player: Player): number {
  switch (card.type) {
    case 'COMMONER':
      return 7;

    case 'BUTLER':
      return card.value + 2;

    case 'KING_FATAL':
      return -Infinity;

    case 'QUEEN_MOTHER': {
      const sum = player.discardPile.reduce((acc, c) => acc + c.value, 0);
      if (sum >= 5) {
        return -Infinity;
      }
      return card.value;
    }

    case 'MARQUISE': {
      const handValue = player.hand ? player.hand.value : 0;
      if (handValue >= 12) {
        return card.value;
      }
      return card.value;
    }

    default:
      return card.value;
  }
}
