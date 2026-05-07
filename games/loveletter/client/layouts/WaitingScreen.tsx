import { useGameConfig } from '../context/GameConfigContext';
import { GameWaitingScreen } from '@core-client/layouts/GameWaitingScreen';
import { CARD_META, CardType } from '../../shared/types';

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
  const { config, setWinPoint, setBonusForValue8, toggleCard } =
    useGameConfig();

  const orderedCardTypes = Object.keys(CARD_META) as CardType[];

  return (
    <GameWaitingScreen
      isHost={isHost}
      config={config}
      startGame={startGame}
      resetGame={resetGame}
      settings={
        <div className="w-full max-w-xs px-6 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg flex flex-col gap-4">
          <div className="text-sm text-gray-300">ゲーム設定</div>

          {/* 勝利ポイント設定 */}
          <div className="flex flex-col gap-2">
            <span>勝利ポイント</span>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
              {[3, 5, 7, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded border flex-shrink-0 ${
                    config.winPoints === p
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 border-white/20'
                  }`}
                  onClick={() => setWinPoint(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 8のボーナス設定 */}
          <div className="flex flex-col gap-2">
            <span>8勝利ボーナス</span>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
              {[1, 2, 3, 5].map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded border flex-shrink-0 ${
                    config.bonusForValue8 === p
                      ? 'bg-blue-400 text-black'
                      : 'bg-white/10 border-white/20'
                  }`}
                  onClick={() => setBonusForValue8(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* カードON/OFF */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">使用カード</span>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {orderedCardTypes.map((type) => {
                const meta = CARD_META[type];

                const enabled =
                  config.enabledCards?.find((c) => c.type === type)?.count ?? 0;

                return (
                  <div
                    key={type}
                    className={`flex flex-col items-start gap-1 text-xs px-2 py-2 rounded border ${
                      enabled > 0
                        ? 'bg-green-500/30 border-green-400'
                        : 'bg-white/10 border-white/20'
                    }`}
                    onClick={() => toggleCard(type)}
                  >
                    <div className="font-semibold">{meta.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">
                      {meta.explain}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      rules={<>まだ未設置</>}
    ></GameWaitingScreen>
  );
}
