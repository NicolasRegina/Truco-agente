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

  // Deep-linking invitation support (?room=ABCD or ?mesa=ABCD)
  const [invitedRoomId, setInvitedRoomId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room') || params.get('mesa');
      return room ? room.trim().toUpperCase() : null;
    }
    return null;
  });
  const [inviteName, setInviteName] = useState<string>(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('truco_saved_player_name')) || profileService.getCached()?.playerName || 'Nico';
  });

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
      <>
        <Lobby
          onStartAiGame={handleStartAiGame}
          onStartMatchmaking={handleStartMatchmaking}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinOnlineRoom}
          currentThemeId={themeId}
        />

        {invitedRoomId && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-speech">
            <div className="bg-stone-950 border-2 border-amber-500/80 rounded-3xl max-w-sm w-full p-6 text-center text-amber-100 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
                🧉
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-amber-400 block mb-1">
                  Desafío Criollo Recibido
                </span>
                <h2 className="text-xl font-black text-amber-200 font-headline">
                  ¡Te invitaron a una mesa!
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  Mesa de juego: <strong className="text-amber-400 font-mono tracking-wider">{invitedRoomId}</strong>
                </p>
              </div>

              <div className="w-full text-left">
                <label className="text-[11px] font-bold text-amber-300/90 block mb-1">
                  Tu apodo para la mesa:
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  maxLength={15}
                  className="w-full bg-black/60 border border-amber-900/60 rounded-xl px-3 py-2 text-sm font-bold text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="w-full flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    const effective = inviteName.trim() || 'Jugador 2';
                    if (typeof localStorage !== 'undefined') {
                      localStorage.setItem('truco_saved_player_name', effective);
                    }
                    profileService.updatePlayerName(effective);
                    const room = invitedRoomId;
                    setInvitedRoomId(null);
                    if (typeof window !== 'undefined' && window.history.replaceState) {
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }
                    handleJoinOnlineRoom(room, effective);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black text-sm rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>¡Aceptar y Entrar a Jugar!</span>
                </button>

                <button
                  onClick={() => {
                    setInvitedRoomId(null);
                    if (typeof window !== 'undefined' && window.history.replaceState) {
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }
                  }}
                  className="w-full py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Rechazar e ir al Menú
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
