import { Modal } from '@core-client/components/Modal';
import { useState } from 'react';
import { Player, GAMES, GameType } from 'shared/types';

type Props = {
  roomId: string;
  players: Player[];
  playerId: string;
  hostId: string;
  isHost: boolean;
  onSelectGame: (gameId: GameType) => void;
  onLeaveRoom: () => void;
};

export default function WaitingScreen({
  roomId,
  players,
  playerId,
  hostId,
  isHost,
  onSelectGame,
  onLeaveRoom,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const selectedGame = GAMES[index];

  const handleSelect = () => {
    if (!isHost) return;
    onSelectGame(selectedGame.id);
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  return (
    <>
      {/* ハンバーガー */}
      <button
        className="absolute top-4 right-4 z-50 text-white text-2xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* メニュー */}

      {/* ゲーム選択UI */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* ゲーム表示（アニメーション付き） */}
        <div
          className="flex flex-col items-center gap-3 transition-all duration-300"
          style={{
            transform:
              direction === 'right'
                ? 'translateX(30px)'
                : direction === 'left'
                  ? 'translateX(-30px)'
                  : 'translateX(0)',
            opacity: direction ? 0.7 : 1,
          }}
        >
          {/* ゲーム名 */}
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {selectedGame.name}
          </div>

          {/* フラットカード表示 */}
          <div className="w-64 h-44 rounded-xl overflow-hidden shadow-lg border border-white/10">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedGame.image})` }}
            />
          </div>
        </div>

        {/* 切り替えボタン */}
        <div className="flex items-center gap-6 text-2xl select-none">
          <button
            onClick={() => {
              setDirection('left');
              setIndex((prev) => (prev - 1 + GAMES.length) % GAMES.length);
              setTimeout(() => setDirection(null), 300);
            }}
            className="hover:scale-110 transition"
          >
            &lt;
          </button>

          <button
            onClick={() => {
              setDirection('right');
              setIndex((prev) => (prev + 1) % GAMES.length);
              setTimeout(() => setDirection(null), 300);
            }}
            className="hover:scale-110 transition"
          >
            &gt;
          </button>
        </div>

        {/* プレイボタン */}
        {isHost && players.length >= 2 && (
          <button
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 transition shadow-lg"
            onClick={handleSelect}
          >
            このゲームをプレイ
          </button>
        )}

        <Modal isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
          <div className="bg-black/80 backdrop-blur border border-white/20 rounded-lg p-4 flex flex-col gap-3 w-56">
            <div
              className="w-full max-w-xs px-6 py-3 text-base rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-all"
              onClick={handleCopyRoomId}
            >
              <div className="text-sm text-gray-300">
                Room ID（タップでコピー）
              </div>
              <div className="text-xl font-semibold tracking-widest">
                {roomId}
              </div>
              {copied && (
                <div className="text-xs text-green-400">コピーしました！</div>
              )}
            </div>
            <div className="border-t border-white/20 my-2" />

            <div className="text-sm text-gray-400">Players</div>
            {players.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <div className="flex gap-2 text-xs">
                  {p.id === playerId && (
                    <span className="text-green-400">YOU</span>
                  )}
                  {p.id === hostId && (
                    <span className="text-yellow-400">HOST</span>
                  )}
                </div>
              </div>
            ))}

            <button
              className="mt-3 bg-red-500/80 rounded px-3 py-2 text-sm hover:bg-red-500"
              onClick={onLeaveRoom}
            >
              退出
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
