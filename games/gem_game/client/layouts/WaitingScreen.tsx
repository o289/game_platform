import { useGemGameConfig } from '../context/GameConfigContext';
import { GameWaitingScreen } from '@core-client/layouts/GameWaitingScreen';

type Props = {
  isHost: boolean;
  startGame: (config: any) => void;
  resetGame: () => void;
};

export default function ({ isHost, startGame, resetGame }: Props) {
  const { config, setConfig } = useGemGameConfig();
  const winCondition = config.winCondition;

  return (
    <GameWaitingScreen
      isHost={isHost}
      config={config}
      startGame={startGame}
      resetGame={resetGame}
      settings={
        <div className="w-full max-w-xs px-6 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg flex flex-col gap-4">
          <div className="text-sm text-gray-300">ルール設定</div>

          {/* 勝利条件タイプ */}
          <div className="flex justify-between items-center">
            <span>勝利条件</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setConfig({
                    ...config,
                    winCondition:
                      config.winCondition.type === 'points'
                        ? { type: 'turn_limit', maxTurns: 20 }
                        : { type: 'points', target: 15 },
                  })
                }
              >
                &lt;
              </button>
              <span className="text-sm">
                {winCondition.type === 'points' ? 'ポイント' : 'ターン'}
              </span>
              <button
                onClick={() =>
                  setConfig({
                    ...config,
                    winCondition:
                      config.winCondition.type === 'points'
                        ? { type: 'turn_limit', maxTurns: 20 }
                        : { type: 'points', target: 15 },
                  })
                }
              >
                &gt;
              </button>
            </div>
          </div>

          {/* ポイント or ターン */}
          {winCondition.type === 'points' ? (
            <div className="flex justify-between items-center">
              <span>ポイント</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const options = [10, 15, 20, 25, 30, 40];
                    const currentIndex = options.indexOf(winCondition.target);
                    const next =
                      options[
                        (currentIndex - 1 + options.length) % options.length
                      ];
                    setConfig({
                      ...config,
                      winCondition: { type: 'points', target: next },
                    });
                  }}
                >
                  &lt;
                </button>
                <span>{winCondition.target}</span>
                <button
                  onClick={() => {
                    const options = [10, 15, 20, 25, 30, 40];
                    const currentIndex = options.indexOf(winCondition.target);
                    const next = options[(currentIndex + 1) % options.length];
                    setConfig({
                      ...config,
                      winCondition: { type: 'points', target: next },
                    });
                  }}
                >
                  &gt;
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span>ターン</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const options = [20, 25, 30, 35, 40];
                    const currentIndex = options.indexOf(winCondition.maxTurns);
                    const next =
                      options[
                        (currentIndex - 1 + options.length) % options.length
                      ];
                    setConfig({
                      ...config,
                      winCondition: { type: 'turn_limit', maxTurns: next },
                    });
                  }}
                >
                  &lt;
                </button>
                <span>{winCondition.maxTurns}</span>
                <button
                  onClick={() => {
                    const options = [20, 25, 30, 35, 40];
                    const currentIndex = options.indexOf(winCondition.maxTurns);
                    const next = options[(currentIndex + 1) % options.length];
                    setConfig({
                      ...config,
                      winCondition: { type: 'turn_limit', maxTurns: next },
                    });
                  }}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}

          {/* デッキ枚数 */}
          <div className="flex justify-between items-center">
            <span>カード枚数</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const options = [40, 50, 60, 70, 100];
                  const currentIndex = options.indexOf(config.deck.level1Count);
                  const next =
                    options[
                      (currentIndex - 1 + options.length) % options.length
                    ];
                  setConfig({ ...config, deck: { level1Count: next } });
                }}
              >
                &lt;
              </button>
              <span>{config.deck.level1Count}</span>
              <button
                onClick={() => {
                  const options = [40, 50, 60, 70, 100];
                  const currentIndex = options.indexOf(config.deck.level1Count);
                  const next = options[(currentIndex + 1) % options.length];
                  setConfig({ ...config, deck: { level1Count: next } });
                }}
              >
                &gt;
              </button>
            </div>
          </div>

          {/* ゴールド */}
          <div className="flex justify-between items-center">
            <span>ゴールド</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const options = [3, 5, 7];
                  const currentIndex = options.indexOf(config.token.goldCount);
                  const next =
                    options[
                      (currentIndex - 1 + options.length) % options.length
                    ];
                  setConfig({ ...config, token: { goldCount: next } });
                }}
              >
                &lt;
              </button>
              <span>{config.token.goldCount}</span>
              <button
                onClick={() => {
                  const options = [3, 5, 7];
                  const currentIndex = options.indexOf(config.token.goldCount);
                  const next = options[(currentIndex + 1) % options.length];
                  setConfig({ ...config, token: { goldCount: next } });
                }}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      }
      rules={
        <>
          <div>
            ■ ゲーム概要 宝石トークンを集めて発展カードを購入し、
            名声ポイントを獲得していくゲームです。
          </div>
          <div>
            ■ 手番でできること（1つ選択） ・異なる色のトークンを3つ取る
            ・同じ色のトークンを2つ取る（4枚以上ある場合）
            ・カードを予約してゴールドトークンを得る ・カードを購入する
          </div>
          <div>
            ■ カード カードはポイントとボーナスを持ち、
            ボーナスは次のカード購入時の割引になります。
          </div>
          <div>■ 貴族 条件を満たすと自動で訪問し、 3ポイント獲得できます。</div>
          <div>■ トークン制限 手番終了時、トークンは最大10枚までです。</div>
          <div>
            ■ 勝利条件 規定ポイントに到達すると最終ラウンドへ。
            最もポイントが高いプレイヤーが勝利します。
          </div>
        </>
      }
    ></GameWaitingScreen>
  );
}
