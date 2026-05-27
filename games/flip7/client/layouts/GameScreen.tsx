import { useState, useEffect, useRef } from 'react';
import { Flip7State } from 'games/flip7/shared/types';
import { Modal } from '../components/Modal';
import { useGame } from '../context/GameContext';
import { Board } from '../components/Board';
import { Events } from '../components/Events';
import { TargetSelect } from '../components/TargetSelect';
import ResultScreen from '@core-client/layouts/ResultScreen';
import { playSound } from '../utils/sound';

/**
 * GameScreen Template
 *
 * 役割:
 * - ゲームプレイ画面のベース
 * - GameStateを受け取って表示
 * - Actionを送信する入口
 *
 * ※ 各ゲームでUI・ロジックを拡張してください
 */

type Props = {
  state: Flip7State;
  sendAction: (action: any) => void;
  isMyTurn: boolean;
};

export default function GameScreen({ state, sendAction, isMyTurn }: Props) {
  const { myPlayer } = useGame();

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const prevRoundRef = useRef<number | null>(null);
  const prevGameEndRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPlayerRef = useRef<string | null>(null);

  const canAct =
    isMyTurn &&
    myPlayer?.status === 'PLAYING' &&
    !state.pendingEffect &&
    state.events.length === 0;

  useEffect(() => {
    if (!state || !myPlayer) return;

    // アクション、イベント演出中はアナウンスを出さない
    if (state.pendingEffect || state.events.length > 0) return;

    let message: string | null = null;
    // ゲーム勝利（変化検知）
    if (
      state.phase === 'GAME_END' &&
      !prevGameEndRef.current &&
      state.winnerIds?.includes(myPlayer.id)
    ) {
      message = state.winnerIds?.includes(myPlayer.id)
        ? 'ゲームに勝利しました！'
        : 'ゲームに敗北しました…';
      prevGameEndRef.current = true;
    }

    // 次ラウンド（変化した時のみ）
    else if (state.round && state.round !== prevRoundRef.current) {
      message = `ラウンド ${state.round}`;
      prevRoundRef.current = state.round;
    }

    // ターン変更（currentPlayer変化）
    else if (
      state.currentPlayer &&
      state.currentPlayer !== prevPlayerRef.current
    ) {
      const currentPlayer = state.players.find(
        (p) => p.id === state.currentPlayer,
      );
      if (currentPlayer) {
        message = `${currentPlayer.name} のターン`;
        prevPlayerRef.current = state.currentPlayer;
      }
    }

    if (message) {
      setAnnouncement(message);

      // 前のタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 新しいタイマーをセット
      timerRef.current = setTimeout(() => {
        setAnnouncement(null);
      }, 2000);
    }

    if (!prevPlayerRef.current && state.currentPlayer) {
      prevPlayerRef.current = state.currentPlayer;
    }
  }, [state, myPlayer]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-white">
      <Board players={state.players} myPlayerId={myPlayer?.id} />
      {/* アクションUI */}
      {canAct && (
        <div className="w-[360px] flex gap-4 justify-center">
          {/* ドロー */}
          <button
            onClick={() => {
              playSound('card');
              sendAction({ type: 'DRAW_CARD' });
            }}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 transition font-bold"
          >
            ワンモア!!
          </button>

          {/* スタンド */}
          <button
            onClick={() => sendAction({ type: 'STAND' })}
            className="flex-1 py-3 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 active:scale-95 transition font-bold"
          >
            ストップ!!
          </button>
        </div>
      )}

      {state.pendingEffect && (
        <TargetSelect
          players={state.players}
          pendingEffect={state.pendingEffect}
          sendAction={sendAction}
        />
      )}
      {state.events.length > 0 && (
        <Events
          events={state.events}
          players={state.players}
          isMyTurn={isMyTurn}
          sendAction={sendAction}
        />
      )}

      <Modal isOpen={!!announcement}>
        {announcement && (
          <>
            <div className="text-yellow-400 text-lg font-bold">お知らせ</div>
            <div className="text-center">{announcement}</div>
          </>
        )}
      </Modal>

      {state.phase === 'GAME_END' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <ResultScreen gameState={state} />
        </div>
      )}
    </div>
  );
}
