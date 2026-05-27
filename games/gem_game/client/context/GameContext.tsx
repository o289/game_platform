import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
} from 'react';
import {
  GemGameState,
  Player,
  Card,
  GemAction,
  TokenColor,
} from '../../shared/types';
import { useCoreGame } from '@core-client/context';
import { playSound } from '../utils/sound';

type GameContextType = {
  state: GemGameState | null;
  sendAction: (action: GemAction) => void;

  myPlayer?: Player;
  isMyTurn: boolean;
  isHost: boolean;

  // ⭐ 追加
  startGame: (config: any) => void;
  resetGame: () => void;

  // トークン
  selectedTokens: TokenColor[];
  addToken: (token: TokenColor) => void;
  resetTokens: () => void;
  isFinishedTokenSelect: boolean;

  // カード
  selectedCard: Card | null;
  cardSource: 'market' | 'reserved' | null;
  handleCardClick: (card: Card, source: 'market' | 'reserved') => void;
  decideCard: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const GemGameProvider = ({ children }: Props) => {
  const {
    gameState,
    myPlayerId,
    startGame,
    resetGame,
    sendAction,
    isMyTurn,
    isHost,
  } = useCoreGame<GemGameState, GemAction>();

  const state = gameState as GemGameState | null;

  const myPlayer = useMemo(() => {
    if (!state || !myPlayerId) return undefined;
    return state.players.find((p) => p.id === myPlayerId);
  }, [state, myPlayerId]);

  // ===== トークン関連 =====
  const [selectedTokens, setSelectedTokens] = useState<TokenColor[]>([]);
  const [isFinishedTokenSelect, setIsFinishedTokenSelect] =
    useState<boolean>(false);

  const addToken = (token: TokenColor) => {
    setSelectedTokens((prev) => [...prev, token]);
    playSound('token');
    const next = [...selectedTokens, token];

    if (next.length === 3 || (next.length === 2 && next[0] === next[1])) {
      setIsFinishedTokenSelect(true);
    }
  };

  const resetTokens = () => {
    setSelectedTokens([]);
    setIsFinishedTokenSelect(false);
  };

  // ===== カード関連 =====
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardSource, setCardSource] = useState<'market' | 'reserved' | null>(
    null,
  );

  const handleCardClick = (card: Card, source: 'market' | 'reserved') => {
    setSelectedCard(card);
    setCardSource(source);
  };

  const decideCard = () => {
    setSelectedCard(null);
    setCardSource(null);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        sendAction,
        startGame,
        resetGame,
        myPlayer,
        isMyTurn,
        isHost,
        // トークン
        selectedTokens,
        addToken,
        resetTokens,
        isFinishedTokenSelect,
        // カード
        selectedCard,
        cardSource,
        handleCardClick,
        decideCard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return ctx;
};
