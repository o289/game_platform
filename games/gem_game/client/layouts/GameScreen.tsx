// src/screens/GameScreen.tsx

import { useEffect, useState } from 'react';

import { Board } from '../components/Board';
import { TokenArea } from '../components/TokenArea';
import { Modal } from '../components/Modal';

import { useGameContext } from '../context/GameContext';

import { CardData } from '../components/CardData';
import { GemGameState, Card, TokenSet } from '../../shared/types';
import { LoadingScreen } from './LoadingScreen';
import { playSound } from '../utils/sound';

import ResultScreen from '@core-client/layouts/ResultScreen';

type Props = {
  state: GemGameState;
  sendAction: (action: any) => void;
  isMyTurn: boolean;
};

export default function GameScreen({ state, sendAction, isMyTurn }: Props) {
  // ===== データ =====
  const {
    myPlayer,
    resetTokens,
    selectedTokens,
    isFinishedTokenSelect,
    selectedCard,
    cardSource,
    handleCardClick,
    decideCard,
  } = useGameContext();
  const decks = state?.decks;
  const levels = [1, 2, 3] as const;

  // ===== 状態 =====
  const [showMyInfo, setShowMyInfo] = useState<string | false>(false);
  const [showDeck, setShowDeck] = useState<boolean>(false);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [prevTurn, setPrevTurn] = useState<number | null>(null);
  const [goNext, setGoNext] = useState<boolean>(false);

  const [payment, setPayment] = useState<TokenSet | null>(null);
  const initPayment: TokenSet = {
    emerald: 0,
    diamond: 0,
    sapphire: 0,
    onyx: 0,
    ruby: 0,
    gold: 0,
  };
  const [reserveLevel, setReserveLevel] = useState<string | null>(null);

  // ===== UI =====
  useEffect(() => {
    if (state) {
      if (prevTurn !== null && state.turn !== prevTurn) {
        setShowTurnModal(true);

        setTimeout(() => {
          setShowTurnModal(false);
        }, 1000);
      }

      setPrevTurn(state.turn);
    }
  }, [state?.turn]);

  if (!state || !myPlayer) {
    return <LoadingScreen type="initial" />;
  }

  return (
    <div className="flex flex-col w-full h-full text-white select-none overflow-hidden">
      <div className="flex flex-col flex-1 bg-white/5 backdrop-blur-md p-2 relative">
        <div className="relative flex flex-col flex-1">
          <div className="flex justify-end gap-2 p-2">
            <button
              className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center"
              onClick={() => {
                const index = state.players.findIndex(
                  (p) => p.id === myPlayer.id,
                );
                setPlayerIndex(index >= 0 ? index : 0);
                setShowMyInfo(myPlayer.id);
              }}
            >
              📖
            </button>
            <button
              className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center"
              onClick={() => {
                setShowDeck(true);
              }}
            >
              🃏
            </button>
          </div>

          {/* ボード＋トークンエリア */}
          <div className="flex flex-col flex-1 justify-between overflow-hidden">
            <div className="overflow-x-auto">
              <Board market={state.market} nobles={state.nobles} />
            </div>
            <TokenArea tokens={state.tokenPool} />
          </div>

          {/* アクションモーダル */}
          {/* ここではマーケットのカードにて予約か購入かを選べる */}
          <Modal isOpen={isMyTurn && selectedCard !== null && payment === null}>
            {selectedCard !== null && payment === null && (
              <div className="flex flex-col gap-4">
                <div>カードアクション</div>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded ${isMyTurn ? 'bg-green-500' : 'bg-gray-500'}`}
                    onClick={() => {
                      playSound('card');
                      setPayment(initPayment);
                    }}
                    disabled={!isMyTurn}
                  >
                    購入
                  </button>
                  {cardSource === 'market' && (
                    <button
                      className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
                      onClick={() => {
                        playSound('card');
                        sendAction({
                          type: 'RESERVE_CARD',
                          payload: {
                            source: 'market',
                            cardId: selectedCard!.id,
                          },
                        });
                        decideCard();
                        setPayment(null);
                        setReserveLevel(null);
                      }}
                      disabled={!isMyTurn}
                    >
                      予約
                    </button>
                  )}
                  <button
                    className="px-3 py-1 bg-gray-500 rounded"
                    onClick={() => {
                      decideCard();
                      setPayment(null);
                      setReserveLevel(null);
                    }}
                  >
                    やめる
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* 購入画面 */}
          <Modal isOpen={isMyTurn && selectedCard !== null && payment !== null}>
            {selectedCard !== null && payment !== null && (
              <div className="flex flex-col gap-4">
                <div className="text-lg font-bold">支払い選択</div>

                {/* カード表示 */}
                <div className="flex justify-center">
                  <div className="w-[100px] h-[140px] border flex items-center justify-center">
                    <CardData card={selectedCard} />
                  </div>
                </div>

                {/* 支払いUI */}
                <div className="flex flex-col gap-2">
                  {(Object.keys(myPlayer.tokens) as (keyof TokenSet)[]).map(
                    (color) => {
                      const owned = myPlayer.tokens[color];
                      const cost =
                        color === 'gold' ? 0 : (selectedCard.cost[color] ?? 0);
                      const bonus =
                        color === 'gold' ? 0 : (myPlayer.bonuses[color] ?? 0);
                      const required = Math.max(cost - bonus, 0);
                      const current = payment?.[color] ?? 0;
                      const remaining = Math.max(required - current, 0);

                      return (
                        <div
                          key={color}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={`/games/gem_game/img/${color}.png`}
                              className="w-6 h-6"
                            />
                            <span>x{owned}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={!isMyTurn || current <= 0}
                              className={`px-2 py-1 rounded ${current <= 0 || !isMyTurn ? 'bg-gray-400' : 'bg-gray-600'}`}
                              onClick={() => {
                                setPayment((prev) => ({
                                  ...prev!,
                                  [color]: prev![color] - 1,
                                }));
                              }}
                            >
                              -
                            </button>

                            <div className="w-6 text-center">{current}</div>

                            <button
                              disabled={
                                !isMyTurn ||
                                current >= owned ||
                                (color !== 'gold' && current >= required)
                              }
                              className={`px-2 py-1 rounded ${!isMyTurn || current >= owned || (color !== 'gold' && current >= required) ? 'bg-gray-400' : 'bg-blue-600'}`}
                              onClick={() => {
                                setPayment((prev) => ({
                                  ...prev!,
                                  [color]: prev![color] + 1,
                                }));
                              }}
                            >
                              +
                            </button>

                            <div
                              className={`text-sm text-red-300 w-12 text-center ${color === 'gold' ? 'invisible' : ''}`}
                            >
                              {remaining}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* ボタン */}
                <div className="flex gap-2 justify-center">
                  <button
                    className={`px-3 py-1 rounded ${isMyTurn ? 'bg-green-500' : 'bg-gray-500'}`}
                    onClick={() => {
                      playSound('card');
                      sendAction({
                        type: 'BUY_CARD',
                        payload: {
                          cardId: selectedCard!.id,
                          payment: payment,
                        },
                      });
                      decideCard();
                      setPayment(null);
                      setReserveLevel(null);
                    }}
                    disabled={!isMyTurn}
                  >
                    確定
                  </button>

                  <button
                    className="px-3 py-1 bg-gray-500 rounded"
                    onClick={() => {
                      decideCard();
                      setPayment(null);
                      setReserveLevel(null);
                    }}
                  >
                    キャンセル
                  </button>

                  <button
                    className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
                    onClick={() => {
                      sendAction({
                        type: 'BUY_CARD',
                        payload: {
                          cardId: selectedCard!.id,
                        },
                      });
                      decideCard();
                      setPayment(null);
                      setReserveLevel(null);
                    }}
                    disabled={!isMyTurn}
                  >
                    オート
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* トークン取得 */}
          <Modal isOpen={isMyTurn && isFinishedTokenSelect}>
            {isMyTurn && isFinishedTokenSelect && (
              <div className="flex flex-col gap-4">
                {isMyTurn && (
                  <>
                    <div>トークン取得</div>
                    <div className="flex gap-2">
                      {selectedTokens.map((t, i) => (
                        <div key={i} className="px-2 py-1 border">
                          {t}
                        </div>
                      ))}
                    </div>
                    <button
                      className={`px-3 py-1 rounded ${isMyTurn ? 'bg-blue-500' : 'bg-gray-500'}`}
                      onClick={() => {
                        sendAction({
                          type: 'TAKE_TOKENS',
                          payload: {
                            tokens: selectedTokens,
                          },
                        });
                        resetTokens();
                      }}
                      disabled={selectedTokens.length === 0}
                    >
                      確定
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-500 rounded"
                      onClick={() => {
                        resetTokens();
                      }}
                    >
                      やり直す
                    </button>
                  </>
                )}
              </div>
            )}
          </Modal>

          {/* プレイヤー情報 */}
          <Modal isOpen={!!showMyInfo} onClose={() => setShowMyInfo(false)}>
            <div className="gap-4">
              <div className="text-lg font-bold">プレイヤー情報</div>

              {/* プレイヤー切り替え */}
              <div className="flex items-center justify-between px-2">
                <button
                  className="px-3 py-1 text-white/70"
                  onClick={() => {
                    const newIndex =
                      (playerIndex - 1 + state.players.length) %
                      state.players.length;
                    setPlayerIndex(newIndex);
                    setShowMyInfo(state.players[newIndex].id);
                  }}
                >
                  &lt;
                </button>

                <div className="font-bold text-blue-400">
                  {state.players[playerIndex]?.name}
                </div>

                <button
                  className="px-3 py-1 text-white/70"
                  onClick={() => {
                    const newIndex = (playerIndex + 1) % state.players.length;
                    setPlayerIndex(newIndex);
                    setShowMyInfo(state.players[newIndex].id);
                  }}
                >
                  &gt;
                </button>
              </div>

              {/* 表示対象プレイヤー */}
              {(() => {
                const targetPlayer =
                  typeof showMyInfo === 'string'
                    ? state.players.find((p) => p.id === showMyInfo)
                    : myPlayer;

                if (!targetPlayer) return null;

                return (
                  <div className="flex flex-col gap-4">
                    <div>スコア: {targetPlayer.point}</div>

                    {/* ボーナス */}
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-sm text-yellow-300 mb-1">
                        ボーナス
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {Object.entries(targetPlayer.bonuses || {}).map(
                          ([token, count]) => (
                            <div
                              key={token}
                              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border rounded shadow-md shadow-black/30"
                            >
                              <img
                                src={`/games/gem_game/img/${token}.png`}
                                className="w-5 h-5"
                                draggable={false}
                              />
                              <span>x{count as number}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* トークン */}
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-sm text-blue-300 mb-1">
                        所持トークン
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {Object.entries(targetPlayer.tokens || {}).map(
                          ([token, count]) => (
                            <div
                              key={token}
                              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border rounded shadow-md shadow-black/30"
                            >
                              <img
                                src={`/games/gem_game/img/${token}.png`}
                                className="w-5 h-5"
                                draggable={false}
                              />
                              <span>x{count as number}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* 予約カード（自分のみ操作可能） */}
                    {
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-sm text-pink-300 mb-1">
                          予約カード
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {targetPlayer.reservedCards.map((card: Card) => (
                            <div
                              key={card.id}
                              className={`w-[100px] h-[140px] flex-shrink-0 border border-yellow-400 flex items-center justify-center transition shadow-lg shadow-black/40 ${
                                targetPlayer.id === myPlayer.id
                                  ? 'cursor-pointer hover:scale-110'
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (targetPlayer.id !== myPlayer.id) return;
                                handleCardClick(card, 'reserved');
                                setShowMyInfo(false);
                              }}
                            >
                              <CardData card={card} />
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                  </div>
                );
              })()}
            </div>
          </Modal>

          {/* 山札 */}
          <Modal isOpen={showDeck} onClose={() => setShowDeck(false)}>
            <div className="flex gap-4 justify-center">
              {levels.map((level) => {
                if (!decks) return null;

                const key = `level${level}` as keyof typeof decks;
                const count = decks?.[key]?.length ?? 0;

                return (
                  <div
                    key={level}
                    onClick={() => {
                      if (!isMyTurn) return;
                      // playSound('card')
                      setReserveLevel(key);
                    }}
                    className={`w-[100px] h-[140px] rounded-lg overflow-hidden relative flex items-center justify-center ${
                      isMyTurn
                        ? 'bg-gray-700 cursor-pointer'
                        : 'bg-gray-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <img
                      src={`/games/gem_game/img/card_lv_${level}.png`}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="relative text-lg font-bold">{count}</div>
                  </div>
                );
              })}
            </div>
          </Modal>

          {/* 山札から予約 */}
          <Modal isOpen={reserveLevel !== null}>
            {reserveLevel !== null && (
              <div className="flex flex-col gap-4 items-center">
                <div>山札から予約しますか？</div>

                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
                    onClick={() => {
                      sendAction({
                        type: 'RESERVE_CARD',
                        payload: {
                          source: 'deck',
                          level: reserveLevel,
                        },
                      });
                      setReserveLevel(null);
                      setShowDeck(false);
                    }}
                    disabled={!isMyTurn}
                  >
                    予約する
                  </button>

                  <button
                    className="px-3 py-1 bg-gray-500 rounded"
                    onClick={() => setReserveLevel(null)}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </Modal>

          <Modal isOpen={showTurnModal}>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-lg text-gray-300">ターン: {state.turn}</div>
            </div>
          </Modal>

          {/* 勝利モーダル */}
          <Modal isOpen={state.roundEndTriggered === true}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-bold text-yellow-300">🎉 勝者</div>

              <div className="text-lg">
                {state.winnerName ?? '誰かが勝ちました'}
              </div>

              <button
                className="px-4 py-2 bg-blue-500 rounded"
                onClick={() => {
                  setGoNext(true);
                }}
              >
                完了
              </button>
            </div>
          </Modal>

          {goNext && <ResultScreen gameState={state} />}
        </div>
      </div>
    </div>
  );
}
