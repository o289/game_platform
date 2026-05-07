import { useGameConfig } from '../context/GameConfigContext';
import { GameWaitingScreen } from '@core-client/layouts/GameWaitingScreen';

/**
 * WaitingScreen Template
 *
 * 役割:
 * - ルーム待機画面の表示
 * - ホストのみゲーム開始
 * - ルール表示（オプション）
 * - ゲーム設定UI（必要に応じて拡張）
 */

type Props = {
  isHost: boolean;
  startGame: (config: any) => void;
  resetGame: () => void;
};

export default function WaitingScreen({ isHost, startGame, resetGame }: Props) {
  const { config, setConfig } = useGameConfig();

  return (
    <GameWaitingScreen
      isHost={isHost}
      config={config}
      startGame={startGame}
      resetGame={resetGame}
      settings={
        <div className="w-full max-w-xs px-6 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg flex flex-col gap-4">
          <div className="text-sm text-gray-300">ゲーム設定</div>

          {/* サンプル設定（必要なら削除 or 置き換え） */}
          <div className="flex justify-between items-center">
            <span>サンプル設定</span>
            <button
              className="px-3 py-1 bg-white/10 border border-white/20 rounded"
              onClick={() => setConfig({ ...config, sample: !config.sample })}
            >
              {config.sample ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      rules={
        <>
          ここにゲームのルールを記述します。 ・プレイヤーは順番に行動します
          ・条件を満たすと勝利します ※ ゲームごとに書き換えてください`
        </>
      }
    ></GameWaitingScreen>
  );
}
