import LoadingScreen from '../layouts/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRoomContext } from '@core-client/context/RoomContext';
import { clientGameRegistry } from '../services/gameRegistry';
import { GameDefinition } from '@core-server/gameRegistry';
import { useAssets } from 'app/hooks/useAssets';
import { ErrorManager } from '@core-server/Error/ErrorManager';
import { SystemError } from 'shared/types';

export default function GameBridge() {
  const { room, setError } = useRoomContext();

  // ルーム取得失敗
  if (!room) {
    try {
      throw new SystemError({
        code: 'ROOM_NOT_FOUND',
        message: '所属している部屋を見つけることができませんでした',
        recovery: [],
      });
    } catch (err) {
      const error = ErrorManager.capture(err);
      setError(error);
      return;
    }
  }

  const game = room.gameType;

  // ゲーム取得失敗
  if (!game) {
    try {
      throw new SystemError({
        code: 'GAME_NOT_INITIALIZED',
        message: 'このゲームは存在しません',
        recovery: [],
      });
    } catch (err) {
      const error = ErrorManager.capture(err);
      setError(error);
      return;
    }
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

  // ゲームキットの存在と部屋全員のアセット読み込み完了まで表示
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
