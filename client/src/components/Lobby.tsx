import React, { useEffect, useState } from 'react';
import { MatchConfig } from '@truco/core';
import { BotDifficulty, loadPlayerStats, PlayerStats } from '@truco/core';
import { Bot, Globe, Play, Sparkles, Trophy, Palette } from 'lucide-react';
import { StatsModal } from './StatsModal';
import { ThemeStoreModal } from './ThemeStoreModal';
import { ThemeId } from '../themes/types';
import { getTheme } from '../themes/themeRegistry';

export type GameMode = 'ai' | 'online_create' | 'online_join';

interface LobbyProps {
  onStartAiGame: (config: MatchConfig, difficulty: BotDifficulty, playerName: string) => void;
  onCreateOnlineRoom: (config: MatchConfig, playerName: string) => void;
  onJoinOnlineRoom: (roomId: string, playerName: string) => void;
  currentThemeId: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartAiGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  currentThemeId,
  onThemeChange
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('ai');
  const [playerName, setPlayerName] = useState(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('truco_saved_player_name')) || 'Nico';
  });
  const [roomCode, setRoomCode] = useState('');
  const [maxScore, setMaxScore] = useState<15 | 30>(30);
  const [withFlor, setWithFlor] = useState<boolean>(false);
  const [aiDifficulty, setAiDifficulty] = useState<BotDifficulty>('canchero');
  const [showStats, setShowStats] = useState(false);
  const [showThemeStore, setShowThemeStore] = useState(false);
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats());

  const currentTheme = getTheme(currentThemeId);

  // Auto-detect invitation URL query parameter (?room=ABC123)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setRoomCode(urlRoom.toUpperCase());
        setSelectedMode('online_join');
      }
    }
  }, []);

  const handlePlayerNameChange = (val: string) => {
    setPlayerName(val);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('truco_saved_player_name', val);
    }
  };

  const handleStart = () => {
    const config: MatchConfig = {
      maxScore,
      withFlor,
      p1Name: playerName || 'Jugador 1',
      p2Name: selectedMode === 'ai' ? `Bot ${aiDifficulty === 'canchero' ? 'Canchero' : aiDifficulty === 'intermedio' ? 'Gaucho' : 'Novato'}` : 'Rival'
    };

    if (selectedMode === 'ai') {
      onStartAiGame(config, aiDifficulty, playerName);
    } else if (selectedMode === 'online_create') {
      onCreateOnlineRoom(config, playerName);
    } else if (selectedMode === 'online_join') {
      if (!roomCode.trim()) {
        alert('Por favor ingresá un código de sala');
        return;
      }
      onJoinOnlineRoom(roomCode.trim().toUpperCase(), playerName);
    }
  };

  return (
    <div className={`min-h-[100dvh] ${currentTheme.colors.tableOuter} flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto relative transition-colors duration-500`}>
      {/* Top Bar with Stats & Theme Store button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowThemeStore(true)}
          className="p-2.5 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          title="Tienda de Temas y Skins"
        >
          <Palette className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Temas ({currentTheme.badge})</span>
        </button>

        <button
          onClick={() => {
            setStats(loadPlayerStats());
            setShowStats(true);
          }}
          className="p-2.5 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          title="Ver estadísticas"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Récords</span>
        </button>
      </div>

      {/* Decorative Title */}
      <div className="text-center mb-6 max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> {currentTheme.name}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight font-serif">
          TRUCO ARGENTINO
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 mt-1">
          Reglas oficiales, IA canchera, baraja ilustrada y multijugador online.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-wood-border max-w-lg w-full rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-600/50 flex flex-col gap-5">
        {/* Mode Selector Tabs (Clean: AI & Online) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 block">
            Modalidad de Juego
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setSelectedMode('ai')}
              className={`p-3.5 rounded-2xl flex flex-col items-center gap-1.5 border font-bold text-xs sm:text-sm transition-all ${
                selectedMode === 'ai'
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg scale-102'
                  : 'bg-black/30 text-stone-300 border-amber-950/60 hover:bg-black/40'
              }`}
            >
              <Bot className="w-6 h-6" />
              <span>vs IA Criolla</span>
            </button>

            <button
              onClick={() => setSelectedMode(selectedMode.startsWith('online') ? selectedMode : 'online_create')}
              className={`p-3.5 rounded-2xl flex flex-col items-center gap-1.5 border font-bold text-xs sm:text-sm transition-all ${
                selectedMode.startsWith('online')
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg scale-102'
                  : 'bg-black/30 text-stone-300 border-amber-950/60 hover:bg-black/40'
              }`}
            >
              <Globe className="w-6 h-6" />
              <span>Multijugador Online</span>
            </button>
          </div>
        </div>

        {/* Online sub-tabs */}
        {selectedMode.startsWith('online') && (
          <div className="flex bg-black/40 p-1 rounded-xl border border-amber-900/40 animate-speech">
            <button
              onClick={() => setSelectedMode('online_create')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedMode === 'online_create' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300'
              }`}
            >
              Crear Sala
            </button>
            <button
              onClick={() => setSelectedMode('online_join')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedMode === 'online_join' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300'
              }`}
            >
              Unirse a Sala
            </button>
          </div>
        )}

        {/* Player Name Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Tu Nombre / Apodo
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handlePlayerNameChange(e.target.value)}
            placeholder="Ingresá tu nombre"
            maxLength={15}
            className="w-full bg-black/40 border border-amber-700/60 rounded-xl px-3.5 py-2.5 text-amber-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Room Code for Online Join */}
        {selectedMode === 'online_join' && (
          <div className="flex flex-col gap-1.5 animate-speech">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Código de Sala (6 letras)
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              maxLength={6}
              className="w-full bg-black/40 border border-amber-700/60 rounded-xl px-3.5 py-2.5 text-amber-100 text-center font-mono text-lg tracking-widest font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        {/* AI Difficulty Selector */}
        {selectedMode === 'ai' && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 block">
              Dificultad de la IA
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['novato', 'intermedio', 'canchero'] as BotDifficulty[]).map((dif) => (
                <button
                  key={dif}
                  onClick={() => setAiDifficulty(dif)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold capitalize border transition-all ${
                    aiDifficulty === dif
                      ? 'bg-amber-600 text-amber-50 border-amber-400 shadow-md'
                      : 'bg-black/30 text-stone-300 border-amber-950/60 hover:bg-black/40'
                  }`}
                >
                  {dif === 'canchero' ? '⭐ Canchero' : dif === 'intermedio' ? 'Gaucho' : 'Novato'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Match Settings (Points & Flor) */}
        {selectedMode !== 'online_join' && (
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-900/40">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 block">
                Puntos
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMaxScore(30)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    maxScore === 30
                      ? 'bg-amber-600 text-amber-50 border-amber-400'
                      : 'bg-black/30 text-stone-300 border-amber-950/60'
                  }`}
                >
                  30 pts
                </button>
                <button
                  onClick={() => setMaxScore(15)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    maxScore === 15
                      ? 'bg-amber-600 text-amber-50 border-amber-400'
                      : 'bg-black/30 text-stone-300 border-amber-950/60'
                  }`}
                >
                  15 pts
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 block">
                Flor
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWithFlor(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    !withFlor
                      ? 'bg-amber-600 text-amber-50 border-amber-400'
                      : 'bg-black/30 text-stone-300 border-amber-950/60'
                  }`}
                >
                  Sin Flor
                </button>
                <button
                  onClick={() => setWithFlor(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    withFlor
                      ? 'bg-amber-600 text-amber-50 border-amber-400'
                      : 'bg-black/30 text-stone-300 border-amber-950/60'
                  }`}
                >
                  Con Flor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Game Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 mt-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-stone-950 font-black text-base sm:text-lg rounded-2xl shadow-2xl border border-amber-200 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          {selectedMode === 'online_join' ? 'Unirse a la Mesa' : 'Comenzar Partida'}
        </button>
      </div>

      {/* Stats Modal */}
      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}

      {/* Theme Store & Skins Modal */}
      {showThemeStore && (
        <ThemeStoreModal
          currentThemeId={currentThemeId}
          onSelectTheme={(id) => {
            onThemeChange(id);
          }}
          onClose={() => setShowThemeStore(false)}
        />
      )}
    </div>
  );
};
