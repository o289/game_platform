import { PublicLoveletterState } from '../../../shared/types';

type Props = {
  state: PublicLoveletterState;
  sendAction: (action: any) => void;
  myPlayer?: { id: string };
};

export function Exchange({ state, sendAction, myPlayer }: Props) {
  const effect = state.pendingEffect;

  if (!effect || effect.type !== 'EXCHANGE') return null;

  const player = state.players.find((p) => p.id === effect.playerId);
  const target = state.players.find((p) => p.id === effect.targetId);

  if (!player || !target) return null;

  const isOwner = myPlayer?.id === effect.playerId;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-lg font-bold">手札交換</div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="text-sm">{player.name}</div>
          <div className="w-20 h-28 bg-gray-300 flex items-center justify-center rounded">
            ???
          </div>
        </div>

        <div className="text-xl font-bold">⇄</div>

        <div className="flex flex-col items-center">
          <div className="text-sm">{target.name}</div>
          <div className="w-20 h-28 bg-gray-300 flex items-center justify-center rounded">
            ???
          </div>
        </div>
      </div>

      {isOwner && !effect.resolved && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded font-bold"
          onClick={() => {
            sendAction({
              type: 'APPLY_EFFECT',
              payload: { effect: 'EXCHANGE' },
            });
          }}
        >
          交換する
        </button>
      )}

      {isOwner && effect.resolved && (
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded font-bold"
          onClick={() =>
            sendAction({
              type: 'APPLY_EFFECT',
              payload: { effect: 'CLEAR_EFFECT' },
            })
          }
        >
          次のターン
        </button>
      )}
    </div>
  );
}
