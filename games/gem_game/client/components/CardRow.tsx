import React from 'react';
import { CardData } from './CardData';
import { Card } from '../../shared/types';

type CardRowProps = {
  cards: Card[];
  onCardPointerDown?: (
    card: Card,
    e: React.PointerEvent<HTMLDivElement>,
  ) => void;
};

export const CardRow: React.FC<CardRowProps> = ({ cards }) => {
  return (
    <div className="flex justify-center gap-2 overflow-x-auto">
      {cards.map((card) => (
        <CardData key={card.id} card={card} />
      ))}
    </div>
  );
};
