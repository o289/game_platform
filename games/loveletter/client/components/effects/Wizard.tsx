import { useEffect } from 'react';
import {
  PublicLoveletterState,
  PublicPlayerState,
} from '../../../shared/types';
import { CardData } from '../CardData';

type Props = {
  state: PublicLoveletterState;
  sendAction: (action: any) => void;
  myPlayer: PublicPlayerState;
};

export function Wizard({ state, sendAction, myPlayer }: Props) {
  const effect = state.pendingEffect;
  if (!effect || effect.type !== 'WIZARD') return null;

  const player = state.players.find((p) => p.id === effect.playerId);
  const target = state.players.find((p) => p.id === effect.targetId);

  const isViewer =
    effect.playerId === myPlayer.id || effect.targetId === myPlayer.id;

  if (!isViewer) return null;

  const isSelf = effect.playerId === effect.targetId;
  const isMeTarget = effect.targetId === myPlayer.id;

  useEffect(() => {
    if (effect.resolved) {
      const timer = setTimeout(() => {
        sendAction({
          type: 'APPLY_EFFECT',
          payload: { effect: 'CLEAR_EFFECT' },
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [effect.resolved]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center gap-4 w-80">
        {/* タイトル */}
        <div className="text-purple-400 font-bold text-lg">魔術師</div>

        {/* 使用メッセージ */}
        <div className="text-sm text-gray-300 text-center">
          {isSelf
            ? `${player?.name} が自分に魔術を使用`
            : `${player?.name} が ${target?.name} に魔術を使用`}
        </div>

        {/* 実行ボタン（未解決時） */}
        {!effect.resolved && (
          <button
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition"
            onClick={() => {
              sendAction({
                type: 'APPLY_EFFECT',
                payload: { effect: 'WIZARD' },
              });
            }}
          >
            カードを引く
          </button>
        )}

        {/* 結果表示 */}
        {effect.resolved && (
          <>
            <div className="text-white text-lg mt-2">
              {isSelf || isMeTarget
                ? 'あなたが引いたカード'
                : `${target?.name} が引いたカード`}
            </div>

            <div className="bg-gray-700 px-4 py-2 rounded text-yellow-300 font-bold text-lg">
              {effect.drawnCard && <CardData card={effect.drawnCard} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
