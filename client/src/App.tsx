import React, { useState } from 'react';
import { MatchConfig, BotDifficulty, PlayerId } from '@truco/core';
import { Lobby } from './components/Lobby';
import { TrucoTable } from './components/TrucoTable';
import { WaitingRoom } from './components/WaitingRoom';
import { MatchmakingModal } from './components/MatchmakingModal';
import { ThemeId } from './themes/types';
import { useGameEngine } from './hooks/useGameEngine';
import { profileService } from './services/profileService';

type Screen = 'lobby' | 'game';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameMode, setGameMode] = useState<'ai' | 'online'>('ai');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  // Enforce authentic gaucho criollo deck until other themes have complete 40-card illustrations
  const [themeId] = useState<ThemeId>('gaucho');
  const [config, setConfig] = useState<MatchConfig>(() => ({
    maxScore: 30,
    withFlor: false,
    p1Name: (typeof localStorage !== 'undefined' && localStorage.getItem('truco_saved_player_name')) || profileService.getCached()?.playerName || 'Jugador 1',
    p2Name: 'Rodri De Paul'
  }));
  const [aiDifficulty, setAiDifficulty] = useState<BotDifficulty>('medio');
  const [onlineRoomId, setOnlineRoomId] = useState<string | undefined>(undefined);
  const [myPlayerId, setMyPlayerId] = useState<PlayerId>('p1');

  const {
    gameState,
    activePlayerId,
    onlineRoomId: serverRoomId,
    isWaitingForOpponent,
    isSearchingMatch,
    opponentDisconnected,
    cancelMatchmaking,
    handleLeaveRoom,
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

  const getEffectivePlayerName = (name?: string) => {
    return (name && name.trim()) || (typeof localStorage !== 'undefined' && localStorage.getItem('truco_saved_player_name')) || profileService.getCached()?.playerName || 'Jugador 1';
  };

  const handleStartAiGame = (matchConfig: MatchConfig, difficulty: BotDifficulty, playerName: string) => {
    const isDif = difficulty === 'dificil' || difficulty === 'canchero';
    const isMed = difficulty === 'medio' || difficulty === 'intermedio';
    const botLabel = isDif ? 'Difícil' : isMed ? 'Medio' : 'Fácil';
    const effectiveName = getEffectivePlayerName(playerName);

    setConfig({
      ...matchConfig,
      p1Name: effectiveName,
      p2Name: `Bot ${botLabel}`
    });
    setAiDifficulty(difficulty);
    setGameMode('ai');
    setIsMatchmaking(false);
    setMyPlayerId('p1');
    setScreen('game');
  };

  const handleStartMatchmaking = (matchConfig: MatchConfig, playerName: string) => {
    const effectiveName = getEffectivePlayerName(playerName);
    setConfig({
      ...matchConfig,
      p1Name: effectiveName,
      p2Name: 'Buscando rival...'
    });
    setGameMode('online');
    setIsMatchmaking(true);
    setOnlineRoomId(undefined);
    setMyPlayerId('p1');
    setScreen('game');
  };

  const handleCreateOnlineRoom = (matchConfig: MatchConfig, playerName: string) => {
    const effectiveName = getEffectivePlayerName(playerName);
    setConfig({
      ...matchConfig,
      p1Name: effectiveName,
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
    if (gameMode === 'online') {
      handleLeaveRoom();
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
      onLeaveRoom={handleLeaveRoom}
      onSendChat={handleSendChat}
      isOnlineMultiplayer={gameMode === 'online'}
      opponentDisconnected={opponentDisconnected}
      roomId={serverRoomId || onlineRoomId}
      themeId={themeId}
    />
  );
};
