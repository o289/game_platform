import { useGame } from "./context/GameContext";
import GameScreen from "./layouts/GameScreen";
import WaitingScreen from "./layouts/WaitingScreen";

/**
 * Game Entry Template
 *
 * 役割:
 * - ゲームの入口コンポーネント
 * - waiting / playing の切り替え
 * - Contextから状態を取得
 */

export default function Flip7() {
  const { state, sendAction, isMyTurn, startGame, isHost } = useGame();

  // デバッグ
  console.log("[Game] rendered", {
    state,
    isMyTurn,
  });

  // まだゲームが開始されていない
  if (!state) {
    return (
      <WaitingScreen
        isHost={isHost}
        startGame={startGame}
      />
    );
  }

  // ゲームプレイ中
  return (
    <GameScreen
      state={state}
      sendAction={sendAction}
      isMyTurn={isMyTurn}
    />
  );
}
