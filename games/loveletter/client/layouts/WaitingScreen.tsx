import { useState } from 'react';
import { useGameConfig } from '../context/GameConfigContext';
import { Modal } from '../components/Modal';
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
};

export default function WaitingScreen({ isHost, startGame }: Props) {
  const { config, setWinPoint, setBonusForValue8, toggleCard } =
    useGameConfig();

  const [openMenu, setOpenMenu] = useState(false);
  const [showRule, setShowRule] = useState(false);

  const orderedCardTypes = Object.keys(CARD_META) as CardType[];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-white">
      {/* メニュー */}
      <button
        className="absolute top-4 right-4 z-50 text-white text-2xl"
        onClick={() => setOpenMenu((v) => !v)}
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
            ルール
          </button>
        </div>
      )}

      {/* タイトル */}
      <div className="text-3xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        待機中...
      </div>

      {/* 設定（必要に応じて拡張） */}
      {isHost && (
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
      )}

      {/* 開始ボタン */}
      {isHost && (
        <button
          className="w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 transition-all shadow-lg"
          onClick={() => startGame(config)}
        >
          ゲーム開始
        </button>
      )}

      {/* ルールモーダル */}
      <Modal isOpen={showRule}>
        <div className="flex flex-col gap-4">
          <div className="text-lg font-bold text-white">ルール</div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {`ここにゲームのルールを記述します。

              ・プレイヤーは順番に行動します
              ・条件を満たすと勝利します

              ※ ゲームごとに書き換えてください`}
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
