import { useState, useEffect, useRef } from 'react';
import { PublicLoveletterState } from 'games/loveletter/shared/types';
import { PlayerStatus } from '../components/PlayerStatus';
import { DiscardPile } from '../components/DiscardPile';
import { Hand } from '../components/Hand';
import { TargetSelector } from '../components/TargetSelector';
import { GuessSelector } from '../components/GuessSelector';
import { Modal } from '../components/Modal';
import { useGame } from '../context/GameContext';
import {
  Clown,
  Battle,
  Exchange,
  Wizard,
  RoundEnd,
} from '../components/effects';
import { CardData } from '../components/CardData';

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
  state: PublicLoveletterState;
  sendAction: (action: any) => void;
  isMyTurn: boolean;
};

export default function GameScreen({ state, sendAction, isMyTurn }: Props) {
  const {
    serverPhase,
    uiPhase,
    myPlayer,
    selectedCard,
    setSelectedCard,
    selectedTargetId,
    setSelectedTargetId,
    guess,
    setGuess,
    canExecute,
    error,
  } = useGame();

  const [announcement, setAnnouncement] = useState<string | null>(null);

  const [discardPile, setDiscardPile] = useState<boolean>(false);
  const [playerStatus, setPlayerStatus] = useState<boolean>(false);

  const prevRoundRef = useRef<number | null>(null);
  const prevGameEndRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== アナウンス =====
  useEffect(() => {
    if (!state || !myPlayer) return;

    // アクション演出中はアナウンスを出さない
    if (state.pendingEffect) return;

    let message: string | null = null;

    // ゲーム勝利（変化検知）
    if (
      state.isGameEnded &&
      !prevGameEndRef.current &&
      state.winnerId === myPlayer.id
    ) {
      message =
        state.winnerId === myPlayer.id
          ? 'ゲームに勝利しました！'
          : 'ゲームに敗北しました…';
      prevGameEndRef.current = true;
    }

    // 次ラウンド（変化した時のみ）
    else if (state.round && state.round !== prevRoundRef.current) {
      message = `ラウンド ${state.round}`;
      prevRoundRef.current = state.round;
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
  }, [state, myPlayer]);

  useEffect(() => {
    if (!state?.isGameEnded) {
      prevGameEndRef.current = false;
    }
  }, [state?.isGameEnded]);

  // ===== 脱落 =====
  useEffect(() => {
    if (state?.pendingEffect?.type === 'ELIMINATED') {
      const timer = setTimeout(() => {
        sendAction({
          type: 'APPLY_EFFECT',
          payload: { effect: 'CLEAR_EFFECT' },
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state?.pendingEffect?.type]);

  const isGameEnded = state?.isGameEnded;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 p-4 text-white">
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <button
          className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center"
          onClick={() => setPlayerStatus(true)}
        >
          👤
        </button>
        <button
          className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center"
          onClick={() => setDiscardPile(true)}
        >
          🃏
        </button>
      </div>

      {!isMyTurn && (
        <div className="text-center text-gray-400">
          他のプレイヤーのターンです
        </div>
      )}

      {/* 手札 */}
      {!isMyTurn ||
        (uiPhase === 'SELECT' && (
          <>
            {state.revealedCards.length > 0 && (
              <div className="flex gap-2 justify-center mb-4">
                {state.revealedCards.map((card, i) => (
                  <CardData key={i} card={card} />
                ))}
              </div>
            )}

            <Hand
              hand={myPlayer?.hand ?? null}
              drawnCard={myPlayer?.drawnCard ?? null}
              selectedCard={selectedCard}
              onSelect={setSelectedCard}
              disabled={uiPhase !== 'SELECT'}
            />
          </>
        ))}

      {isMyTurn && serverPhase === 'DRAW' && !state.pendingEffect && (
        <div className="justify-center">
          <div className="text-center text-sm text-gray-300">
            残り山札: {state.deckCount}
          </div>

          <button
            className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => {
              playSound('card');
              sendAction({ type: 'DRAW_CARD', payload: {} });
            }}
          >
            山札から引く
          </button>
        </div>
      )}

      {/* 対象選択 */}
      {uiPhase === 'TARGET' && selectedCard && (
        <TargetSelector
          players={state.players}
          currentPlayerId={state.currentPlayer}
          selectedTargetId={selectedTargetId}
          onSelect={setSelectedTargetId}
          disabled={!isMyTurn}
          allowSelf={selectedCard.type === 'WIZARD'}
        />
      )}

      {/* 推測（兵士のみ） */}
      {uiPhase === 'GUESS' && selectedCard?.type === 'SOLDIER' && (
        <GuessSelector
          selectedGuess={guess}
          onSelect={setGuess}
          disabled={!isMyTurn}
        />
      )}

      {canExecute && isMyTurn && (
        <div className="text-center text-green-400">実行できます</div>
      )}

      {/* 実行ボタン */}
      {canExecute && (
        <div className="flex justify-center">
          <button
            className="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition disabled:opacity-50"
            disabled={!canExecute}
            onClick={() => {
              sendAction({
                type: 'PLAY_CARD',
                payload: {
                  cardType: selectedCard?.type,
                  targetPlayerId: selectedTargetId,
                  guess: guess,
                },
              });

              // リセット
              setSelectedCard(undefined);
              setSelectedTargetId(undefined);
              setGuess(undefined);
            }}
          >
            カードを使用
          </button>
        </div>
      )}

      {/* 各効果UI */}
      {state.pendingEffect && (
        <>
          {/* ターゲットのカードを見る */}
          {state.pendingEffect?.type === 'REVEAL' && (
            <Clown state={state} sendAction={sendAction} />
          )}

          {/* 比較演出（騎士 / 学者） */}
          {state.pendingEffect?.type === 'BATTLE' &&
            (state.pendingEffect.attackerId === myPlayer?.id ||
              state.pendingEffect.targetId === myPlayer?.id) && (
              <Battle
                state={state}
                sendAction={sendAction}
                myPlayer={myPlayer}
              />
            )}

          {/* 交換 */}
          {state.pendingEffect?.type === 'EXCHANGE' &&
            (state.pendingEffect.playerId === myPlayer?.id ||
              state.pendingEffect.targetId === myPlayer?.id) && (
              <Exchange
                state={state}
                sendAction={sendAction}
                myPlayer={myPlayer}
              />
            )}

          {/* 魔術師 */}
          {state.pendingEffect.type === 'WIZARD' &&
            (state.pendingEffect.playerId === myPlayer?.id ||
              state.pendingEffect.targetId === myPlayer?.id) && (
              <Wizard
                state={state}
                sendAction={sendAction}
                myPlayer={myPlayer}
              />
            )}

          {/* 脱落 */}
          {state.pendingEffect.type === 'ELIMINATED' && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center gap-4 w-80">
                <div className="text-red-400 text-xl font-bold">
                  {state.pendingEffect.playerId}脱落!
                </div>

                <div className="text-center text-sm text-gray-200">
                  {state.pendingEffect.reason}
                </div>
              </div>
            </div>
          )}

          {/* ラウンドエンド */}
          {state.pendingEffect.type === 'ROUND_END' && myPlayer && (
            <RoundEnd
              state={state}
              sendAction={sendAction}
              myPlayer={myPlayer}
            />
          )}
        </>
      )}

      {/* プレイヤー状態 */}
      <Modal isOpen={playerStatus} onClose={() => setPlayerStatus(false)}>
        <PlayerStatus
          players={state.players}
          currentPlayerId={state.currentPlayer}
        />
      </Modal>

      {/* 捨て札 */}
      <Modal isOpen={discardPile} onClose={() => setDiscardPile(false)}>
        <DiscardPile players={state.players} />
      </Modal>

      {/* エラー */}
      <Modal isOpen={!!error || !!announcement}>
        <div className="flex flex-col items-center gap-4">
          {error && (
            <>
              <div className="text-red-400 text-lg font-bold">
                無効なアクション
              </div>
              <div className="text-center">{error}</div>
            </>
          )}

          {announcement && !error && (
            <>
              <div className="text-yellow-400 text-lg font-bold">お知らせ</div>
              <div className="text-center">{announcement}</div>
            </>
          )}
        </div>
      </Modal>

      {isGameEnded && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <ResultScreen gameState={state} />
        </div>
      )}
    </div>
  );
}
