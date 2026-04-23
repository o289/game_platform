import React from 'react';
import { Card, CARD_META } from '../../shared/types';

type Props = {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
};

export const CardData: React.FC<Props> = ({ card, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-32 h-48 rounded-xl border-2 flex flex-col justify-between
        p-2 cursor-pointer transition-all duration-200
        ${isSelected ? 'border-yellow-400 scale-105' : 'border-white/20'}
        bg-white shadow-lg ${CARD_META[card.type].textColor}
        hover:scale-105
      `}
    >
      {/* 上部：数字 */}
      <div className="flex justify-between font-bold text-lg">
        <span>{card.value}</span>
        <span>{card.value}</span>
      </div>

      {/* 中央：イラスト */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src={`/games/loveletter/img/${CARD_META[card.type].imageName}.png`}
          alt={CARD_META[card.type].label}
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* 下部：カード名 */}
      <div className="text-center text-sm font-bold">
        {CARD_META[card.type]?.label ?? card.type}
      </div>

      {/* 効果説明（簡易） */}
      <div className="text-[10px] text-gray-600 text-center">
        {CARD_META[card.type]?.explain}
      </div>
    </div>
  );
};
