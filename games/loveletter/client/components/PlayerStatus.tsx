import React from 'react';
import { PublicPlayerState } from '../../shared/types';

type Props = {
  players: PublicPlayerState[];
  currentPlayerId: string;
};

export const PlayerStatus: React.FC<Props> = ({ players, currentPlayerId }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {players.map((player) => {
        const isCurrent = player.id === currentPlayerId;

        return (
          <div
            key={player.id}
            className={`
              px-4 py-2 rounded-lg border text-center min-w-[120px]
              ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }
              ${player.isEliminated ? 'opacity-40' : ''}
            `}
          >
            <div className="font-bold text-gray-700">{player.name}</div>

            <div className="text-xs mt-1 text-gray-600">
              {player.isEliminated && '脱落'}
              {!player.isEliminated && player.isProtected && '無敵'}
              {!player.isEliminated && !player.isProtected && '通常'}
            </div>

            <div className="text-xs mt-1 text-gray-600">
              得点: {player.point}
            </div>

            <div className="text-xs mt-1 text-gray-600">
              脱落回数: {player.eliminatedCount}
            </div>

            <div className="text-xs text-gray-400 mt-1">
              手札: {player.hand ? '1' : '0'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
