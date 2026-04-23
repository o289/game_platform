import { useCoreGame } from '@core-client/context';

type Props = {
  gameState: any;
};

export default function ResultScreen({ gameState }: Props) {
  if (!gameState) return null;

  const { rematch, backToConfig, resetGame } = useCoreGame();

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold text-white">ゲーム終了</h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="w-full px-6 py-3 text-base rounded-lg font-semibold transition-all bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-105 shadow-lg"
          onClick={() => rematch()}
        >
          もう一度プレイ
        </button>

        <button
          className="w-full px-6 py-3 text-base rounded-lg font-semibold transition-all bg-gradient-to-r from-purple-400 to-pink-500 hover:scale-105 shadow-lg"
          onClick={() => backToConfig()}
        >
          設定に戻る
        </button>

        <button
          className="w-full px-6 py-3 text-base rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-400 to-cyan-500 hover:scale-105 shadow-lg"
          onClick={() => resetGame()}
        >
          ゲーム選択へ
        </button>
      </div>
    </div>
  );
}
