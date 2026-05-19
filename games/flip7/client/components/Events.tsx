import { useEffect, useRef, useState } from 'react';
import { CardRenderer } from './cards/CardRenderer';
import { Modal } from '../components/Modal';
import { Player, GameEvent } from 'games/flip7/shared/types';
import { playSound } from '../utils/sound';

// 仮：外から受け取る想定（実際はcontextやpropsに合わせて調整）
type Props = {
  events: GameEvent[];
  players: Player[];
  isMyTurn: boolean;
  sendAction: (action: { type: string }) => void;
};

export function Events({ events, players, isMyTurn, sendAction }: Props) {
  const isSendingRef = useRef(false);
  const [isHidden, setIsHidden] = useState(false);
  const currentEvent = events[0];

  function consumeEvent() {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setIsHidden(true);
    sendAction({ type: 'CONSUME_EVENT' });

    // 2秒後に再表示（ただしイベントが変われば即表示される）
    setTimeout(() => {
      isSendingRef.current = false;
      setIsHidden(false);
    }, 1500);
  }

  useEffect(() => {
    isSendingRef.current = false;
  }, [currentEvent]);

  if (!currentEvent) return null;

  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name ?? 'Unknown';
  };

  const renderEvent = (event: GameEvent) => {
    switch (event.type) {
      case 'draw':
        return `${getPlayerName(event.playerId)} がカードを引いた`;

      case 'stand':
        return `${getPlayerName(event.playerId)} はこのラウンドを降り、得点を確定した`;

      case 'bust':
        return `${getPlayerName(event.playerId)} はバーストした`;

      case 'flip7':
        return `${getPlayerName(event.playerId)} が Flip7を達成!`;

      case 'freeze':
        return `${getPlayerName(event.from)} が ${getPlayerName(event.to)} をフリーズ!`;

      case 'flipThree':
        return `${getPlayerName(event.playerId)} にフリップスリー！`;

      case 'secondChance':
        return `${getPlayerName(event.playerId)} がセカンドチャンスを獲得`;

      case 'useSecondChance':
        return `${getPlayerName(event.playerId)}がセカンドチャンスを使い、バーストを回避!`;

      default:
        return '';
    }
  };

  useEffect(() => {
    if (!currentEvent) return;

    if (currentEvent.type === 'bust') {
      playSound('bust');
    }

    if (currentEvent.type === 'flip7') {
      playSound('achieve');
    }
  }, [currentEvent]);

  return (
    <Modal isOpen={true}>
      <div className="p-6 text-center text-lg font-bold">
        {renderEvent(currentEvent)}

        {currentEvent.type === 'draw' && (
          <div className="mt-4 flex justify-center">
            <CardRenderer card={currentEvent.card} />
          </div>
        )}

        {!isHidden && isMyTurn && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={consumeEvent}
              className="px-6 py-2 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 active:scale-95 transition"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
