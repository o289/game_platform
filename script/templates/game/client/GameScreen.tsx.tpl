

import { useState, useEffect } from "react";
import { Modal } from '../components/Modal'
import { useGame } from '../context/GameContext';

/**
 * GameScreen Template
 *
 * 役割:
 * - ゲームプレイ画面のベース
 * - GameStateを受け取って表示
 * - Actionを送信する入口
 *
 * ※ 各ゲームでUI・ロジックを拡張してください
 */

type Props = {
  state: any;
  sendAction: (action: any) => void;
  isMyTurn?: boolean;
};

export default function GameScreen({ state, sendAction, isMyTurn }: Props) {
  const {
    myPlayer,
    error,
  } = useGame();
  
  // デバッグ用
  useEffect(() => {
    console.log("[GameScreen] state updated:", state);
  }, [state]);

  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-white">
      {/* タイトル */}
      <div className="text-2xl font-bold">ゲームプレイ中</div>

      {/* 状態表示（デバッグ用） */}
      <pre className="text-xs bg-black/40 p-4 rounded max-w-md overflow-auto">
        {JSON.stringify(state, null, 2)}
      </pre>

      {/* ターン表示 */}
      {isMyTurn !== undefined && (
        <div className="text-sm text-gray-300">
          {isMyTurn ? "あなたのターンです" : "他のプレイヤーのターン"}
        </div>
      )}

      {/* サンプルアクション */}
      <button
        className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
        onClick={() =>
          sendAction({
            type: "INCREMENT",
            payload: {},
          })
        }
      >
        サンプルアクション
      </button>

      <Modal isOpen={!!error}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-400 text-lg font-bold">
            無効なアクション
          </div>
          <div className="text-center">
            {error}
          </div>
        </div>
      </Modal>

    </div>
  );
}