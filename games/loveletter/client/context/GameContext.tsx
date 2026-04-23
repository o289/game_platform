import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  PublicLoveletterState,
  PublicPlayerState,
  CardType,
  Card,
  GameAction,
  Phase,
} from '../../shared/types';
import { useCoreGame } from '@core-client/context';

// UIフェーズ（入力状態用）
type UiPhase =
  | 'WAIT'
  | 'DRAW'
  | 'SELECT'
  | 'TARGET'
  | 'GUESS'
  | 'READY'
  | 'WAIT_EFFECT';

/**
 * GameContext Template
 *
 * 役割:
 * - GameState を提供
 * - Action送信関数を提供
 * - UIからゲームロジックへの入口
 * - providerにはchildren以外のpropsを入れない
 *
 * ※ socketや型は各プロジェクトに合わせて差し替えてください
 */

type GameContextValue = {
  state: PublicLoveletterState | null;
  sendAction: (action: GameAction) => void;
  isMyTurn: boolean;
  isHost: boolean;

  startGame: (config: any) => void;
  resetGame: () => void;

  // UI用
  myPlayer?: PublicPlayerState;

  serverPhase: Phase;
  uiPhase: UiPhase;

  // 選択状態
  selectedCard?: Card;
  selectedTargetId?: string;
  guess?: CardType;

  // helper
  canPlayCard: (cardType: CardType) => boolean;
  canExecute: boolean;

  setSelectedCard: (card?: Card) => void;
  setSelectedTargetId: (id?: string) => void;
  setGuess: (card?: CardType) => void;

  error: string | null;
};

const GameContext = createContext<GameContextValue | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
};

type Props = {
  children: React.ReactNode;
};

export const GameProvider = ({ children }: Props) => {
  const {
    gameState,
    myPlayerId,
    startGame,
    resetGame,
    sendAction,
    isMyTurn,
    isHost,
    error,
  } = useCoreGame<PublicLoveletterState, GameAction>();
  const [selectedCard, setSelectedCard] = useState<Card | undefined>();
  const [selectedTargetId, setSelectedTargetId] = useState<
    string | undefined
  >();
  const [guess, setGuess] = useState<CardType | undefined>();

  const state = gameState as PublicLoveletterState | null;

  const myPlayer = useMemo(() => {
    if (!state || !myPlayerId) return undefined;
    return state.players.find((p) => p.id === myPlayerId);
  }, [state, myPlayerId]);

  const serverPhase: Phase = state?.phase ?? 'DRAW';

  const needsTarget = [
    'SOLDIER',
    'CLOWN',
    'KNIGHT',
    'WIZARD',
    'GENERAL',
    'MERCHANT',
    'SCHOLAR',
    'SERVANT',
  ];

  const validTargets =
    state?.players.filter(
      (p) => p.id !== myPlayerId && !p.isEliminated && !p.isProtected,
    ) ?? [];

  const uiPhase: UiPhase = useMemo(() => {
    if (!isMyTurn) return 'WAIT';

    if (serverPhase === 'WAIT_EFFECT') return 'WAIT_EFFECT';

    if (serverPhase === 'DRAW') return 'DRAW';

    if (serverPhase === 'PLAY') {
      if (!selectedCard) return 'SELECT';

      const needs = needsTarget.includes(selectedCard.type);

      if (needs && validTargets.length > 0 && !selectedTargetId) {
        return 'TARGET';
      }

      if (
        selectedCard.type === 'SOLDIER' &&
        needs &&
        selectedTargetId &&
        !guess
      ) {
        return 'GUESS';
      }

      return 'READY';
    }

    return 'WAIT';
  }, [
    isMyTurn,
    serverPhase,
    selectedCard,
    selectedTargetId,
    guess,
    validTargets,
  ]);

  const canExecute = uiPhase === 'READY';

  const canPlayCard = (cardType: CardType) => {
    if (!isMyTurn) return false;

    // 出せないカード
    if (cardType === 'DOG' || cardType === 'COUNTESS') {
      return false;
    }

    // MARQUISE制約（簡易）
    if (myPlayer?.hand && myPlayer?.drawnCard) {
      const hasMarquise =
        myPlayer.hand.type === 'MARQUISE' ||
        myPlayer.drawnCard.type === 'MARQUISE';

      if (hasMarquise) {
        return cardType === 'MARQUISE';
      }
    }

    return true;
  };

  const value = useMemo(
    () => ({
      state,
      sendAction,
      isHost,
      isMyTurn: !!isMyTurn,
      myPlayer,
      serverPhase,
      uiPhase,
      startGame,
      resetGame,
      selectedCard,
      selectedTargetId,
      guess,
      canPlayCard,
      canExecute,
      setSelectedCard,
      setSelectedTargetId,
      setGuess,
      error,
    }),
    [
      state,
      isHost,
      isMyTurn,
      myPlayer,
      serverPhase,
      uiPhase,
      selectedCard,
      selectedTargetId,
      guess,
      canExecute,
      error,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
