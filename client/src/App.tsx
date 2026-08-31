import React, { useState } from 'react';
import { MatchConfig, BotDifficulty, PlayerId } from '@truco/core';
import { Lobby } from './components/Lobby';
import { TrucoTable } from './components/TrucoTable';
import { WaitingRoom } from './components/WaitingRoom';
import { useGameEngine } from './hooks/useGameEngine';

type Screen = 'lobby' | 'game';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameMode, setGameMode] = useState<'ai' | 'local' | 'online'>('ai');
  const [config, setConfig] = useState<MatchConfig>({
    maxScore: 30,
    withFlor: false,
    p1Name: 'Nico',
    p2Name: 'Bot Canchero'
  });
  const [aiDifficulty, setAiDifficulty] = useState<BotDifficulty>('canchero');
  const [onlineRoomId, setOnlineRoomId] = useState<string | undefined>(undefined);
  const [myPlayerId, setMyPlayerId] = useState<PlayerId>('p1');

  const {
    gameState,
    activePlayerId,
    onlineRoomId: serverRoomId,
    isWaitingForOpponent,
    dispatchAction,
    handleNextHand,
    handleRestartMatch,
    handleSendChat
  } = useGameEngine({
    mode: gameMode,
    config,
    aiDifficulty,
    roomId: onlineRoomId,
    myPlayerId
  });

  const handleStartAiGame = (matchConfig: MatchConfig, difficulty: BotDifficulty, playerName: string) => {
    setConfig({
      ...matchConfig,
      p1Name: playerName,
      p2Name: `Bot ${difficulty === 'canchero' ? 'Canchero' : difficulty === 'intermedio' ? 'Gaucho' : 'Novato'}`
    });
    setAiDifficulty(difficulty);
    setGameMode('ai');
    setMyPlayerId('p1');
    setScreen('game');
  };

  const handleStartLocalGame = (matchConfig: MatchConfig, p1Name: string, p2Name: string) => {
    setConfig({
      ...matchConfig,
      p1Name,
      p2Name
    });
    setGameMode('local');
    setMyPlayerId('p1');
    setScreen('game');
  };

  const handleCreateOnlineRoom = (matchConfig: MatchConfig, playerName: string) => {
    setConfig({
      ...matchConfig,
      p1Name: playerName,
      p2Name: 'Esperando rival...'
    });
    setGameMode('online');
    setOnlineRoomId(undefined);
    setMyPlayerId('p1');
    setScreen('game');
  };

  const handleJoinOnlineRoom = (roomId: string, playerName: string) => {
    setConfig((prev) => ({
      ...prev,
      p2Name: playerName
    }));
    setGameMode('online');
    setOnlineRoomId(roomId);
    setMyPlayerId('p2');
    setScreen('game');
  };

  const handleBackToLobby = () => {
    setScreen('lobby');
    setOnlineRoomId(undefined);
  };

  if (screen === 'lobby') {
    return (
      <Lobby
        onStartAiGame={handleStartAiGame}
        onStartLocalGame={handleStartLocalGame}
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
      />
    );
  }

  // If in online mode and waiting for second player to connect, show Waiting Room screen!
  if (gameMode === 'online' && isWaitingForOpponent) {
    return (
      <WaitingRoom
        roomId={serverRoomId || onlineRoomId || '...'}
        config={config}
        playerName={config.p1Name || 'Jugador 1'}
        onCancel={handleBackToLobby}
      />
    );
  }

  // In local 2-player pass-and-play mode, the active player matches the current turn player
  const currentViewPlayerId = gameMode === 'local' ? gameState.turn : activePlayerId;

  return (
    <TrucoTable
      state={gameState}
      myPlayerId={currentViewPlayerId}
      onAction={dispatchAction}
      onNextHand={handleNextHand}
      onRestartMatch={handleRestartMatch}
      onBackToLobby={handleBackToLobby}
      onSendChat={handleSendChat}
      isOnlineMultiplayer={gameMode === 'online'}
      roomId={serverRoomId || onlineRoomId}
    />
  );
};
