import { useState } from 'react';
import { Player } from 'games/flip7/shared/types';
import { CardRenderer } from './cards/CardRenderer';

type Props = {
  players: Player[];
  myPlayerId?: string;
};

export function Board({ players, myPlayerId }: Props) {
  const [currentPlayerId, setCurrentPlayerId] = useState(myPlayerId);

  const currentPlayer = players.find((p) => p.id === currentPlayerId)!;

  return (
    <div className="w-full flex flex-col">
      {/* Tabs */}
      <div className="flex overflow-x-auto p-2 gap-2">
        {players.map((p) => (
          <div
            key={p.id}
            onClick={() => setCurrentPlayerId(p.id)}
            className={`
              relative px-4 py-2 rounded-full cursor-pointer whitespace-nowrap
              ${p.id === currentPlayerId ? 'bg-yellow-400 text-black' : 'bg-gray-600'}
            `}
          >
            {p.name}

            {p.field.secondChance && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1f1f1f]" />
            )}
          </div>
        ))}
      </div>

      {/* Field */}
      <div className="p-5 flex flex-col gap-5 overflow-y-auto">
        {/* scores */}
        <div className="flex flex-col gap-1 px-4 py-2 rounded-lg border border-gray-600">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">TOTAL</span>
            <span className="font-bold text-yellow-400">
              {currentPlayer.totalScore}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">ROUND</span>
            <span className="font-bold text-yellow-400">
              {currentPlayer.roundScore}
            </span>
          </div>
        </div>

        {/* Modifier */}
        <div>
          <div className="flex gap-2 overflow-x-auto flex-shrink-0 pb-2">
            {currentPlayer.field.modifiers.map((m, i) => (
              <div
                key={i}
                className="w-[130px] flex-shrink-0 rounded-lg flex items-center justify-center font-bold bg-yellow-400 text-black"
              >
                <CardRenderer card={m} />
              </div>
            ))}
          </div>
        </div>

        {/* Number */}
        <div>
          <div className="flex gap-2 overflow-x-auto flex-shrink-0 pb-2">
            {currentPlayer.field.numberCards.map((n, i) => (
              <div
                key={i}
                className="w-[130px] flex-shrink-0 rounded-lg flex items-center justify-center font-bold bg-[#d9d2b3] text-black"
              >
                <CardRenderer card={n} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
