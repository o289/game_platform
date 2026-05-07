import React from 'react';
import { useState } from 'react';
import { Modal } from '../components/Modal';

type Props = {
  isHost: boolean;
  config: any;
  startGame: (config: any) => void;
  resetGame: () => void;
  settings: React.ReactNode;
  rules: React.ReactNode;
};

export function GameWaitingScreen({
  isHost,
  startGame,
  resetGame,
  config,
  settings,
  rules,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showRule, setShowRule] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh w-full px-4">
      <button
        className="absolute top-4 right-4 z-50 text-white text-2xl"
        onClick={() => setOpenMenu(!openMenu)}
      >
        ☰
      </button>
      {openMenu && (
        <div className="absolute top-14 right-4 bg-black/80 backdrop-blur border border-white/20 rounded-lg p-4 flex flex-col gap-2 z-50">
          <button
            className="text-left hover:text-yellow-400"
            onClick={() => {
              setShowRule(true);
              setOpenMenu(false);
            }}
          >
            ルールブック
          </button>
        </div>
      )}

      <div className="text-3xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        待機中...
      </div>

      {/* ルール設定 */}

      {isHost && (
        <>
          <div>{settings}</div>
          <div className="flex flex-col gap-3">
            <button
              className="w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 transition-all shadow-lg"
              onClick={() => {
                startGame(config);
              }}
            >
              ゲーム開始
            </button>

            <button
              className="w-full px-6 py-3 text-base rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-400 to-cyan-500 hover:scale-105 shadow-lg"
              onClick={() => resetGame()}
            >
              戻る
            </button>
          </div>
        </>
      )}

      <Modal isOpen={showRule}>
        <div className="flex flex-col gap-4">
          <div className="text-lg font-bold text-white">ルール</div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {rules}
          </div>
          <button
            className="mt-2 w-full py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition"
            onClick={() => setShowRule(false)}
          >
            閉じる
          </button>
        </div>
      </Modal>
    </div>
  );
}
