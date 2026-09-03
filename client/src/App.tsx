import React, { useState } from 'react';
import { MatchConfig, BotDifficulty, PlayerId } from '@truco/core';
import { Lobby } from './components/Lobby';
import { TrucoTable } from './components/TrucoTable';
import { WaitingRoom } from './components/WaitingRoom';
import { MatchmakingModal } from './components/MatchmakingModal';
import { ThemeId } from './themes/types';
import { useGameEngine } from './hooks/useGameEngine';

type Screen = 'lobby' | 'game';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameMode, setGameMode] = useState<'ai' | 'online'>('ai');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  // Enforce authentic gaucho criollo deck until other themes have complete 40-card illustrations
  const [themeId] = useState<ThemeId>('gaucho');
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
    isSearchingMatch,
    cancelMatchmaking,
    dispatchAction,
    handleNextHand,
    handleRestartMatch,
    handleSendChat
  } = useGameEngine({
    mode: gameMode,
    config,
    aiDifficulty,
    roomId: onlineRoomId,
    myPlayerId,
    isMatchmaking
  });

  const handleStartAiGame = (matchConfig: MatchConfig, difficulty: BotDifficulty, playerName: string) => {
    setConfig({
      ...matchConfig,
      p1Name: playerName,
      p2Name: `Bot ${difficulty === 'canchero' ? 'Canchero' : difficulty === 'intermedio' ? 'Gaucho' : 'Novato'}`
    });
    setAiDifficulty(difficulty);
    setGameMode('ai');
    setIsMatchmaking(false);
    setMyPlayerId('p1');
    setScreen('game');
  };

  const handleStartMatchmaking = (matchConfig: MatchConfig, playerName: string) => {
    setConfig({
      ...matchConfig,
      p1Name: playerName,
      p2Name: 'Buscando rival...'
    });
    setGameMode('online');
    setIsMatchmaking(true);
    setOnlineRoomId(undefined);
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
    setIsMatchmaking(false);
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
    setIsMatchmaking(false);
    setOnlineRoomId(roomId);
    setMyPlayerId('p2');
    setScreen('game');
  };

  const handleBackToLobby = () => {
    if (isMatchmaking) {
      cancelMatchmaking();
    }
    setIsMatchmaking(false);
    setScreen('lobby');
    setOnlineRoomId(undefined);
  };

  if (screen === 'lobby') {
    return (
      <Lobby
        onStartAiGame={handleStartAiGame}
        onStartMatchmaking={handleStartMatchmaking}
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
        currentThemeId={themeId}
      />
    );
  }

  // If in online mode and searching for a public match, show MatchmakingModal!
  if (gameMode === 'online' && isMatchmaking && (isSearchingMatch || !serverRoomId)) {
    return (
      <MatchmakingModal
        playerName={config.p1Name || 'Jugador 1'}
        config={config}
        onCancel={handleBackToLobby}
      />
    );
  }

  // If in online private room and waiting for second player to connect, show Waiting Room screen!
  if (gameMode === 'online' && !isMatchmaking && isWaitingForOpponent) {
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
    />
  );
};
