import React from 'react';
import { CardType, CARD_META } from '../../shared/types';
import { useGameConfig } from '../context/GameConfigContext';

type Props = {
  selectedGuess?: CardType;
  onSelect: (card: CardType) => void;
  disabled?: boolean;
};

// SOLDIERでは推測不可
const EXCLUDED: CardType[] = ['SOLDIER'];

export const GuessSelector: React.FC<Props> = ({
  selectedGuess,
  onSelect,
  disabled = false,
}) => {
  const { config } = useGameConfig();
  const enabledCards = config.enabledCards;
  const selectable = enabledCards.filter((c) => !EXCLUDED.includes(c.type));

  return (
    <div className="grid grid-cols-3 gap-2 px-2">
      {selectable.map((card) => {
        const isSelected = selectedGuess === card.type;

        return (
          <button
            key={card.type}
            onClick={() => {
              if (disabled) return;
              onSelect(card.type);
            }}
            className={`
              px-3 py-1 h-10 rounded border text-sm transition-all inline-flex items-center justify-center min-w-[100px]
              ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white border-gray-300 text-black'
              }
              ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-100 cursor-pointer'
              }
            `}
          >
            {CARD_META[card.type].label}
          </button>
        );
      })}
    </div>
  );
};
