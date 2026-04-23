import { useEffect } from 'react';
import { CardData } from '../CardData';
import { PublicLoveletterState } from 'games/loveletter/shared/types';

type Props = {
  state: PublicLoveletterState;
  sendAction: (action: any) => void;
  myPlayer?: { id: string };
};

export function Battle({ state, sendAction, myPlayer }: Props) {
  const effect = state.pendingEffect;
  if (!effect || effect.type !== 'BATTLE' || !myPlayer) return null;
  const player = state.players.find((p) => p.id === effect.attackerId);
  const target = state.players.find((p) => p.id === effect.targetId);

  if (!player || !target) return null;

  const isAttacker = myPlayer.id === effect.attackerId;

  useEffect(() => {
    if (effect.resolved && isAttacker) {
      const timer = setTimeout(() => {
        sendAction({
          type: 'APPLY_EFFECT',
          payload: {
            effect: 'CLEAR_BATTLE',
          },
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [effect.resolved]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-purple-400 text-lg font-bold">カード比較</div>

      <div className="flex gap-8 items-center">
        {/* 自分 */}
        <div className="flex flex-col items-center">
          <div className="text-sm text-gray-400">{player.name}</div>
          {effect.resolved ? (
            <div className="text-xl font-bold">
              <CardData card={effect.myCard} />
            </div>
          ) : (
            <div className="w-20 h-28 bg-gray-300 flex items-center justify-center rounded">
              ???
            </div>
          )}
        </div>

        <div className="text-2xl">VS</div>

        {/* 相手 */}
        <div className="flex flex-col items-center">
          <div className="text-sm text-gray-400">{target.name}</div>
          {effect.resolved ? (
            <div className="text-xl font-bold">
              <CardData card={effect.targetCard} />
            </div>
          ) : (
            <div className="w-20 h-28 bg-gray-300 flex items-center justify-center rounded">
              ???
            </div>
          )}
        </div>
      </div>
      {isAttacker && !effect.resolved && (
        <button
          onClick={() => {
            sendAction({
              type: 'APPLY_EFFECT',
              payload: { effect: 'BATTLE' },
            });
          }}
          className="px-4 py-2 bg-red-500 text-white rounded font-bold"
        >
          勝負!!
        </button>
      )}
    </div>
  );
}
