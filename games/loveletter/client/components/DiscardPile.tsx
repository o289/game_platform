import React from 'react';
import { PublicPlayerState, Card } from '../../shared/types';
import { CardData } from './CardData';

type Props = {
  players: PublicPlayerState[];
};

export const DiscardPile: React.FC<Props> = ({ players }) => {
  return (
    <div className="block overflow-x-auto">
      {players.map((player) => {
        return (
          <div
            key={player.id}
            className="border rounded-lg p-2 bg-gray-50 min-w-[160px]"
          >
            <div className="font-bold mb-2 flex justify-between">
              <span>{player.name}</span>
              <span className="text-sm text-gray-500">
                {player.isEliminated ? '脱落' : ''}
              </span>
            </div>

            {player.discardPile.length === 0 ? (
              <div className="text-gray-400 text-sm">捨て札なし</div>
            ) : (
              <div className="flex gap-2 overflow-x-auto">
                {player.discardPile.map((card: Card, index: number) => (
                  <div key={`${card.type}-${index}`} className="scale-60">
                    <CardData card={card} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
