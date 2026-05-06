import { useState } from 'react';
import { Player, PendingEffect } from 'games/flip7/shared/types';
import { Modal } from './Modal';

type Props = {
  players: Player[];
  pendingEffect?: PendingEffect;
  sendAction: (action: any) => void;
};

export function TargetSelect({ players, pendingEffect, sendAction }: Props) {
  const [selected, setSelected] = useState<Player | null>(null);

  // pendingEffectがない場合は何も表示しない
  if (!pendingEffect) return null;

  const handleSelect = (player: Player) => {
    setSelected(player);
  };

  const handleConfirm = () => {
    if (!selected) return;

    sendAction({
      type: 'SELECT_ACTION_TARGET',
      payload: {
        targetPlayerId: selected.id,
      },
    });

    setSelected(null);
  };

  const handleCancel = () => {
    setSelected(null);
  };

  return (
    <>
      {/* ターゲット選択 */}
      <Modal isOpen={true}>
        <div className="p-4 text-center">
          <div className="mb-4 font-bold text-lg">誰に適用しますか？</div>

          <div className="flex flex-wrap gap-2 justify-center">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="px-4 py-2 bg-gray-600 rounded-lg"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* 確認モーダル */}
      {selected && (
        <Modal isOpen={true}>
          <div className="p-6 text-center">
            <div className="mb-4 font-bold">
              {selected.name} に適用しますか？
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-500 rounded-lg"
              >
                はい
              </button>

              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 rounded-lg"
              >
                キャンセル
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
