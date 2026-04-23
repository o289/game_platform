import { useEffect } from 'react';
import { PublicLoveletterState } from '../../../shared/types';
import { CardData } from '../CardData';

type Props = {
  state: PublicLoveletterState;
  sendAction: (action: any) => void;
};

export function Clown({ state, sendAction }: Props) {
  const effect = state.pendingEffect;

  if (!effect || effect.type !== 'REVEAL') return null;

  const target = state.players.find((p) => p.id === effect.targetId);

  useEffect(() => {
    if (!state.pendingEffect || state.pendingEffect.type !== 'REVEAL') return;

    const timer = setTimeout(() => {
      // サーバーにクリアを送信（actionがある前提）
      sendAction({
        type: 'APPLY_EFFECT',
        payload: { effect: 'CLEAR_EFFECT' },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.pendingEffect]);

  if (!target) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-blue-400 text-lg font-bold">手札を確認しました</div>
      <div className="text-center">
        {target.name}
        のカードは
      </div>
      <div className="text-xl font-bold text-white">
        <CardData card={effect.card} />
      </div>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded font-bold"
        onClick={() =>
          sendAction({
            type: 'APPLY_EFFECT',
            payload: { effect: 'CLEAR_EFFECT' },
          })
        }
      >
        OK
      </button>
    </div>
  );
}
