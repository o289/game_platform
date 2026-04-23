import LoadingScreen from '../layouts/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRoomContext } from '@core-client/context/RoomContext';
import { clientGameRegistry } from '../services/gameRegistry';
import { GameDefinition } from '@core-server/gameRegistry';
import { useAssets } from 'app/hooks/useAssets';

export default function GameBridge() {
  const { room, gameState, setGameState, myPlayerId } = useRoomContext();

  // ルーム未取得
  if (!room) return null;

  // ゲーム未選択
  if (!room.gameType) {
    return <div>そのゲームは存在しません</div>;
  }

  const { loaded, progress } = useAssets(room.gameType);

  const game = room.gameType;
  const [def, setDef] = useState<GameDefinition | null>(null);

  useEffect(() => {
    const load = async () => {
      const loader = clientGameRegistry[game];
      if (!loader) return;

      const mod = await loader();
      setDef(mod.definition);
    };

    load();
  }, [room.gameType]);

  if (!def || !loaded) {
    return <LoadingScreen progress={progress} />;
  }

  const GameComponent = def.component;
  const Providers = def.providers ?? [];

  const wrapped = Providers.reduceRight(
    (acc, Provider) => {
      return <Provider>{acc}</Provider>;
    },
    <GameComponent
      gameState={gameState}
      setGameState={setGameState}
      roomId={room.id}
      hostId={room.hostId}
      myPlayerId={myPlayerId}
    />,
  );

  return wrapped;
}
