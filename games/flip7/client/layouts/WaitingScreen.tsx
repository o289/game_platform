import { useState } from 'react';
import { useGameConfig } from '../context/GameConfigContext';
import { Modal } from '../components/Modal';

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
  const { config, setFlip7Bonus, setTargetScore } = useGameConfig();

  const [openMenu, setOpenMenu] = useState(false);
  const [showRule, setShowRule] = useState(false);

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

          {/* サンプル設定（必要なら削除 or 置き換え） */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <span>勝利ポイント</span>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                {[100, 150, 200, 300, 500].map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-1 rounded border flex-shrink-0 ${
                      config.targetScore === p
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/10 border-white/20'
                    }`}
                    onClick={() => setTargetScore(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span>Flip7ボーナス</span>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
              {[10, 15, 20, 30, 50].map((b) => (
                <button
                  key={b}
                  className={`px-3 py-1 rounded border flex-shrink-0 ${
                    config.flip7Bonus === b
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 border-white/20'
                  }`}
                  onClick={() => setFlip7Bonus(b)}
                >
                  {b}
                </button>
              ))}
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
            <div>
              ■ 目的
              最初に指定された得点（例：200点）に到達したプレイヤーの勝利。
            </div>
            <div>
              ■ 基本ルール ・カードを引くか、パスして得点を確定するかを選ぶ
              ・同じ数字カードを引くとバースト（このラウンドの得点は0）
              ・異なる数字カードの合計がラウンドスコアになる
            </div>

            <div>
              ■ Flip7 ・異なる数字カードを7種類集めると即ラウンド終了
              ・ボーナス（例：+15点）を獲得 ■ 修正カード ・+2〜+10：得点に加算
              ・×2：合計点を2倍（加算より先に適用）
            </div>
            <div>
              ■ アクションカード ・フリーズ：対象プレイヤーを強制パス
              ・フリップスリー：3枚連続でカードを引く
              ・セカンドチャンス：1回だけバーストを無効化
            </div>
            <div>
              ■ ラウンド終了 ・全員がパス or バースト ・または誰かがFlip7達成
            </div>
            <div>■ 得点計算 合計 → ×2 → 加算 → Flip7ボーナス</div>
            <div>
              ■ ゲーム終了 ラウンド終了時に目標点に到達したプレイヤーが勝利
            </div>
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
