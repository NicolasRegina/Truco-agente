import React, { useState } from 'react';
import { MatchConfig, BotDifficulty, PlayerId } from '@truco/core';
import { Lobby } from './components/Lobby';
import { TrucoTable } from './components/TrucoTable';
import { WaitingRoom } from './components/WaitingRoom';
import { ThemeId } from './themes/types';
import { DEFAULT_THEME_ID } from './themes/themeRegistry';
import { useGameEngine } from './hooks/useGameEngine';

type Screen = 'lobby' | 'game';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameMode, setGameMode] = useState<'ai' | 'online'>('ai');
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return ((typeof localStorage !== 'undefined' && localStorage.getItem('truco_theme_id')) as ThemeId) || DEFAULT_THEME_ID;
  });
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

  const handleThemeChange = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('truco_theme_id', newThemeId);
    }
  };

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
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
        currentThemeId={themeId}
        onThemeChange={handleThemeChange}
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

  return (
    <TrucoTable
      state={gameState}
      myPlayerId={activePlayerId}
      onAction={dispatchAction}
      onNextHand={handleNextHand}
      onRestartMatch={handleRestartMatch}
      onBackToLobby={handleBackToLobby}
      onSendChat={handleSendChat}
      isOnlineMultiplayer={gameMode === 'online'}
      roomId={serverRoomId || onlineRoomId}
      themeId={themeId}
      onThemeChange={handleThemeChange}
    />
  );
};
