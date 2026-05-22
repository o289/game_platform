import LoadingScreen from '../layouts/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRoomContext } from '@core-client/context/RoomContext';
import { clientGameRegistry } from '../services/gameRegistry';
import { GameDefinition } from '@core-server/gameRegistry';
import { useAssets } from 'app/hooks/useAssets';

export default function GameBridge() {
  const { room } = useRoomContext();

  // ルーム未取得
  if (!room) return null;

  const game = room.gameType;

  // ゲーム未選択
  if (!game) {
    return <div>そのゲームは存在しません</div>;
  }

  const { loaded, progress } = useAssets(game);

  const [def, setDef] = useState<GameDefinition | null>(null);
  const allPlayersLoaded = room.players.every((p) => p.isAssetReady);

  const isReady = loaded && allPlayersLoaded;

  useEffect(() => {
    const load = async () => {
      const loader = clientGameRegistry[game];
      if (!loader) return;

      const mod = await loader();
      setDef(mod.definition);
    };

    load();
  }, [game]);

  if (!def || !isReady) {
    return <LoadingScreen progress={progress} />;
  }

  const GameComponent = def.component;
  const Providers = def.providers ?? [];

  const wrapped = Providers.reduceRight(
    (acc, Provider) => {
      return <Provider>{acc}</Provider>;
    },
    <GameComponent />,
  );

  return wrapped;
}
