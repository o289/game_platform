import React from 'react';
import { Card } from '../../shared/types';
import { CardData } from './CardData';

type Props = {
  hand: Card | null;
  drawnCard: Card | null;
  selectedCard?: Card;
  requestSelectCard: (card: Card) => void;
  disabled?: boolean;
};

export const Hand: React.FC<Props> = ({
  hand,
  drawnCard,
  selectedCard,
  requestSelectCard,
  disabled = false,
}) => {
  const cards: Card[] = [];

  if (hand) cards.push(hand);
  if (drawnCard) cards.push(drawnCard);

  if (cards.length === 0) {
    return <div className="text-gray-400">手札がありません</div>;
  }

  return (
    <div className="flex gap-4 justify-center items-end">
      {cards.map((card, index) => {
        const isSelected = selectedCard === card;

        return (
          <div
            key={`${card.type}-${index}`}
            onClick={() => {
              if (disabled) return;
              requestSelectCard(card);
            }}
            className={`
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <CardData card={card} isSelected={isSelected} />
          </div>
        );
      })}
    </div>
  );
};
