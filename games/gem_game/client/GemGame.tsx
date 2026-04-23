import { useGameContext } from './context/GameContext';
import GameScreen from './layouts/GameScreen';
import WaitingScreen from './layouts/WaitingScreen';

export default function GemGame() {
  const { state, sendAction, isMyTurn, isHost, startGame } = useGameContext();

  if (!state) {
    return <WaitingScreen isHost={isHost} startGame={startGame} />;
  }

  return (
    <GameScreen state={state} sendAction={sendAction} isMyTurn={isMyTurn} />
  );
}
