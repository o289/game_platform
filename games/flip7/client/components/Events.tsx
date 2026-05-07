import { useEffect } from 'react';
import { CardRenderer } from './cards/CardRenderer';
import { Modal } from '../components/Modal';
import { Player, GameEvent } from 'games/flip7/shared/types';
import { playSound } from '../utils/sound';

// 仮：外から受け取る想定（実際はcontextやpropsに合わせて調整）
type Props = {
  events: GameEvent[];
  players: Player[];
  sendAction: (action: { type: string }) => void;
};

export function Events({ events, players, sendAction }: Props) {
  const currentEvent = events[0];

  function consumeEvent() {
    sendAction({ type: 'CONSUME_EVENT' });
  }

  // 1秒後に自動で次へ
  useEffect(() => {
    if (!currentEvent) return;

    const timer = setTimeout(() => {
      consumeEvent();
    }, 1000);

    return () => clearTimeout(timer);
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
        playSound('bust');
        return `${getPlayerName(event.playerId)} はバーストした`;

      case 'flip7':
        playSound('achieve');
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

  return (
    <Modal isOpen={true}>
      <div className="p-6 text-center text-lg font-bold">
        {renderEvent(currentEvent)}

        {currentEvent.type === 'draw' && (
          <div className="mt-4 flex justify-center">
            <CardRenderer card={currentEvent.card} />
          </div>
        )}
      </div>
    </Modal>
  );
}
