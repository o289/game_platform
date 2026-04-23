import { useEffect, useRef } from 'react';
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

export function RoundEnd({ state, sendAction, myPlayer }: Props) {
  const effect = state.pendingEffect;
  if (!effect || effect.type !== 'ROUND_END') return null;

  const winners = state.players.filter((p) => effect.winnerIds.includes(p.id));
  const winnerNames = winners.map((w) => w.name).join(' と ');
  const hasSentRef = useRef(false);

  // ⭐ effectが変わった時だけリセット
  useEffect(() => {
    if (effect?.type === 'ROUND_END') {
      hasSentRef.current = false;
    }
  }, [effect?.type]);

  // ⭐ CLEAR_EFFECT送信
  useEffect(() => {
    if (!effect || effect.type !== 'ROUND_END') return;

    // ⭐ 1人だけ送る
    if (myPlayer.id !== state.currentPlayer) return;

    // ⭐ 多重送信防止
    if (hasSentRef.current) return;
    hasSentRef.current = true;

    const timer = setTimeout(() => {
      if (effect.reason !== 'HIGH_CARD') {
        sendAction({
          type: 'APPLY_EFFECT',
          payload: { effect: 'CLEAR_ROUND' },
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [effect?.type, myPlayer.id, state.currentPlayer]);

  useEffect(() => {
    if (!effect || effect.type !== 'ROUND_END') return;
    if (!effect.resolved) return;

    const timer = setTimeout(() => {
      sendAction({
        type: 'APPLY_EFFECT',
        payload: { effect: 'CLEAR_ROUND' },
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [effect?.resolved]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center gap-4 w-96">
        {/* タイトル */}
        <div className="text-yellow-400 text-xl font-bold">ラウンド終了</div>

        {/* 勝利理由 */}
        <div className="text-sm text-gray-300 text-center">
          {effect.reason === 'HIGH_CARD'
            ? effect.resolved
              ? '手札の強さで勝敗が決まりました'
              : '山札が尽きました'
            : '最後まで生き残ったプレイヤーの勝利です'}
        </div>

        {/* カード比較（HIGH_CARDのみ） */}
        {effect.reason === 'HIGH_CARD' &&
          effect.resolved &&
          effect.playerCards?.length && (
            <div className="w-full mt-2 space-y-2">
              {effect.playerCards.map((c) => {
                const p = state.players.find((pl) => pl.id === c.playerId);
                if (!p) return null;
                const isWinner = effect.winnerIds.includes(c.playerId);

                return (
                  <div
                    key={c.playerId}
                    className={`flex justify-between px-3 py-2 rounded ${
                      isWinner ? 'bg-green-700' : 'bg-gray-700'
                    }`}
                  >
                    <span>{p.name}</span>
                    <CardData card={c.card} />
                    <span>{c.value}</span>
                  </div>
                );
              })}
            </div>
          )}

        {effect.reason === 'HIGH_CARD' &&
          !effect.resolved &&
          myPlayer.id !== state.currentPlayer && (
            <button
              className="mt-4 bg-blue-500 px-4 py-2 rounded text-white"
              onClick={() => {
                sendAction({
                  type: 'APPLY_EFFECT',
                  payload: { effect: 'CARD_SHOW' },
                });
              }}
            >
              手札勝負
            </button>
          )}

        {/* 勝者 */}
        {(effect.reason !== 'HIGH_CARD' || effect.resolved) && (
          <div className="text-green-400 font-bold text-lg mt-2">
            {winnerNames} の勝利！
          </div>
        )}
      </div>
    </div>
  );
}
