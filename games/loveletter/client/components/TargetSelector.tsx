import React from 'react';
import { PublicPlayerState } from '../../shared/types';

type Props = {
  players: PublicPlayerState[];
  currentPlayerId: string;
  selectedTargetId?: string;
  onSelect: (playerId: string) => void;
  disabled?: boolean;
  allowSelf?: boolean; // ⭐追加
};

export const TargetSelector: React.FC<Props> = ({
  players,
  currentPlayerId,
  selectedTargetId,
  onSelect,
  disabled = false,
  allowSelf = false,
}) => {
  const selectablePlayers = players.filter((p) => {
    if (p.isEliminated) return false;

    // 自分を選べるかどうか
    if (!allowSelf && p.id === currentPlayerId) return false;

    return true;
  });

  if (selectablePlayers.length === 0) {
    return (
      <div className="text-gray-400 text-center">
        選択可能なプレイヤーがいません
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto px-2">
      {selectablePlayers.map((player) => {
        const isSelected = selectedTargetId === player.id;

        return (
          <div
            key={player.id}
            onClick={() => {
              if (disabled) return;
              onSelect(player.id);
            }}
            className={`
              relative px-4 py-2 rounded-lg border-2 text-center transition-all min-w-[140px]
              ${
                isSelected
                  ? 'border-yellow-500 bg-yellow-200 scale-105 shadow-lg'
                  : 'border-gray-300 bg-gray-50'
              }
              ${player.isProtected ? 'opacity-50' : ''}
              ${
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:scale-105'
              }
            `}
          >
            {isSelected && (
              <div className="absolute top-1 right-1 text-yellow-600 font-bold">
                ✓
              </div>
            )}
            <div className="font-bold text-gray-900">{player.name}</div>
            <div className="text-xs text-gray-600">
              {isSelected
                ? '選択中'
                : player.isProtected
                  ? '保護中'
                  : '対象可能'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
