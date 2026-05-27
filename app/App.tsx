import HomeScreen from '@core-client/layouts/HomeScreen';
import WaitingScreen from '@core-client/layouts/WaitingScreen';
import GameBridge from './components/GameBridge';
import SystemErrorScreen from '@core-client/layouts/SystemErrorScreen';

import { useState } from 'react';
import { GameType } from 'shared/types';
import { useRoom } from './hooks/useRoom';

export const App = () => {
  const [name, setName] = useState<string>('');
  const room = useRoom(name);

  const handleCreateRoom = () => {
    room.onCreateRoom();
  };

  const handleJoinRoom = (roomId: string) => {
    room.onJoinRoom(roomId);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-dvh px-4 gap-6 text-white"
      style={{
        backgroundImage: "url('core/img/cafeteria.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <>
        {/* オーバーレイ（暗くする） */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

        <div className="relative flex flex-col items-center justify-center gap-6 w-full h-full px-4 text-white">
          {room.error && (
            <SystemErrorScreen
              title={room.error.title}
              message={room.error.message}
              onClose={() => {
                room.onClearAnnounce();
              }}
            />
          )}

          {!room.isCurrentRoom && (
            <HomeScreen
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              name={name}
              setName={setName}
            />
          )}

          {room.isCurrentRoom && room.status === 'waiting' && (
            <WaitingScreen
              roomId={room.roomId || ''}
              players={room.players || []}
              playerId={room.playerId || ''}
              hostId={room.hostId || ''}
              isHost={room.isHost || false}
              onSelectGame={(gameId: GameType) => room.onSelectGame(gameId)}
              onLeaveRoom={() => {
                room.onLeaveRoom();
              }}
            />
          )}
        </div>

        {(room.status === 'gameWaiting' || room.status === 'playing') && (
          <div className="absolute inset-0 w-full h-dvh overflow-hidden">
            <GameBridge />
          </div>
        )}
      </>
    </div>
  );
};
