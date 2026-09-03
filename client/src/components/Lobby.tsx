import React, { useEffect, useState } from 'react';
import { MatchConfig, BotDifficulty, loadPlayerStats, PlayerStats } from '@truco/core';
import { Bot, Globe, Play, Sparkles, Trophy, Palette, GraduationCap, Zap } from 'lucide-react';
import { StatsModal } from './StatsModal';
import { ThemeId } from '../themes/types';
import { getTheme } from '../themes/themeRegistry';

export type GameMode = 'ai' | 'public' | 'online_create' | 'online_join';

interface LobbyProps {
  onStartAiGame: (config: MatchConfig, difficulty: BotDifficulty, playerName: string) => void;
  onStartMatchmaking: (config: MatchConfig, playerName: string) => void;
  onCreateOnlineRoom: (config: MatchConfig, playerName: string) => void;
  onJoinOnlineRoom: (roomId: string, playerName: string) => void;
  currentThemeId: ThemeId;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartAiGame,
  onStartMatchmaking,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  currentThemeId
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
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats());

  // Modo Aprendiz setting (persisted)
  const [coachMode, setCoachMode] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('truco_coach_mode') === 'true';
  });

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

  const handleCoachToggle = () => {
    const next = !coachMode;
    setCoachMode(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('truco_coach_mode', String(next));
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
    } else if (selectedMode === 'public') {
      onStartMatchmaking(config, playerName);
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
    <div className={`min-h-[100dvh] ${currentTheme.colors.tableOuter} flex flex-col items-center justify-between p-3 sm:p-6 overflow-y-auto relative transition-colors duration-500 pt-[max(env(safe-area-inset-top,0px),16px)] pb-[max(env(safe-area-inset-bottom,0px),20px)]`}>
      {/* Ambient warm tavern light glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Top utility bar */}
      <header className="w-full max-w-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 border border-amber-500/40 shadow-lg text-[11px] font-black text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>EDICIÓN BODEGÓN</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme badge (Criollo only for now until new decks are ready) */}
          <div
            className="px-3 py-1 rounded-full bg-stone-900/80 border border-amber-900/50 text-amber-300/80 shadow flex items-center gap-1.5 text-xs font-bold select-none cursor-default"
            title="Baraja Criolla oficial (Nuevos temas en preparación)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono">Baraja Criolla</span>
          </div>

          <button
            onClick={() => {
              setStats(loadPlayerStats());
              setShowStats(true);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-amber-500/50 text-amber-300 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
            title="Ver estadísticas"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-mono">Récords</span>
          </button>
        </div>
      </header>

      {/* Brand Hero Header */}
      <div className="text-center my-1 sm:my-3 max-w-lg z-10">
        {/* Heraldic Sol de Mayo Seal */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 animate-pulse opacity-40 blur-sm"></div>
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-2xl flex items-center justify-center border border-amber-200">
            <span className="text-2xl sm:text-3xl drop-shadow">☀️</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 tracking-tight font-serif drop-shadow-md">
          TRUCO ARGENTINO
        </h1>
        <p className="text-xs sm:text-sm text-stone-300/90 font-medium mt-1">
          Baraja criolla auténtica • IA con picardía • Salas P2P
        </p>
      </div>

      {/* Main Luxury Glassmorphic Form Card */}
      <div className="w-full max-w-md bg-stone-950/85 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-500/35 flex flex-col gap-3.5 sm:gap-4 z-10 relative">
        {/* Mode Selector Tabs (AI vs Pública vs Privada) */}
        <div>
          <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1.5 block">
            Modalidad de Juego
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedMode('ai')}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center gap-1 border font-extrabold text-xs sm:text-sm transition-all ${
                selectedMode === 'ai'
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-lg scale-102'
                  : 'bg-stone-900/60 text-stone-300 border-amber-900/40 hover:bg-stone-800'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>vs IA</span>
            </button>

            <button
              onClick={() => setSelectedMode('public')}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center gap-1 border font-extrabold text-xs sm:text-sm transition-all relative ${
                selectedMode === 'public'
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-lg scale-102'
                  : 'bg-stone-900/60 text-stone-300 border-amber-900/40 hover:bg-stone-800'
              }`}
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Pública</span>
            </button>

            <button
              onClick={() => setSelectedMode(selectedMode.startsWith('online') ? selectedMode : 'online_create')}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center gap-1 border font-extrabold text-xs sm:text-sm transition-all ${
                selectedMode.startsWith('online')
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-lg scale-102'
                  : 'bg-stone-900/60 text-stone-300 border-amber-900/40 hover:bg-stone-800'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Privada</span>
            </button>
          </div>
        </div>

        {/* Public Match info banner */}
        {selectedMode === 'public' && (
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 animate-speech flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[11px] leading-tight">
              <strong>Partida Pública:</strong> Entrarás a la cola de espera. En cuanto otro jugador busque rival, se emparejarán automáticamente.
            </span>
          </div>
        )}

        {/* Online Private sub-tabs */}
        {selectedMode.startsWith('online') && (
          <div className="flex bg-black/60 p-1 rounded-xl border border-amber-900/50 animate-speech">
            <button
              onClick={() => setSelectedMode('online_create')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedMode === 'online_create' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300'
              }`}
            >
              Crear Sala
            </button>
            <button
              onClick={() => setSelectedMode('online_join')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedMode === 'online_join' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300'
              }`}
            >
              Unirse con Código
            </button>
          </div>
        )}

        {/* Player Name Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80">
            Tu Nombre / Apodo
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handlePlayerNameChange(e.target.value)}
            placeholder="Ingresá tu nombre"
            maxLength={15}
            className="w-full bg-black/50 border border-amber-700/60 rounded-xl px-3.5 py-2 text-amber-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-500"
          />
        </div>

        {/* Room Code for Online Join */}
        {selectedMode === 'online_join' && (
          <div className="flex flex-col gap-1 animate-speech">
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80">
              Código de Sala (6 letras)
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              maxLength={6}
              className="w-full bg-black/50 border border-amber-700/60 rounded-xl px-3.5 py-2 text-amber-100 text-center font-mono text-base sm:text-lg tracking-widest font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        {/* AI Difficulty Selector */}
        {selectedMode === 'ai' && (
          <div>
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1 block">
              Personalidad del Rival
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['novato', 'intermedio', 'canchero'] as BotDifficulty[]).map((dif) => (
                <button
                  key={dif}
                  onClick={() => setAiDifficulty(dif)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-0.5 ${
                    aiDifficulty === dif
                      ? 'bg-amber-600 text-amber-50 border-amber-300 shadow-md ring-1 ring-amber-300'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  <span className="text-sm">
                    {dif === 'canchero' ? '🕶️' : dif === 'intermedio' ? '🤠' : '🌱'}
                  </span>
                  <span className="capitalize">{dif === 'canchero' ? 'Canchero' : dif === 'intermedio' ? 'Gaucho' : 'Novato'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Match Settings (Points & Flor) */}
        {selectedMode !== 'online_join' && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-900/40">
            <div>
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1 block">
                Puntos
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMaxScore(30)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all ${
                    maxScore === 30
                      ? 'bg-amber-600 text-amber-50 border-amber-300'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800'
                  }`}
                >
                  30 pts
                </button>
                <button
                  onClick={() => setMaxScore(15)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all ${
                    maxScore === 15
                      ? 'bg-amber-600 text-amber-50 border-amber-300'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800'
                  }`}
                >
                  15 pts
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1 block">
                Flor
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setWithFlor(false)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all ${
                    !withFlor
                      ? 'bg-amber-600 text-amber-50 border-amber-300'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800'
                  }`}
                >
                  Sin Flor
                </button>
                <button
                  onClick={() => setWithFlor(true)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all ${
                    withFlor
                      ? 'bg-amber-600 text-amber-50 border-amber-300'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800'
                  }`}
                >
                  Con Flor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modo Aprendiz Toggle Box */}
        <div
          onClick={handleCoachToggle}
          className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
            coachMode
              ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50 shadow-inner'
              : 'bg-stone-900/50 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${coachMode ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-200">Modo Aprendiz</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                  Consejos IA
                </span>
              </div>
              <span className="text-[10px] text-stone-400 leading-tight">
                Sugerencias en vivo sobre qué cantar o qué carta jugar
              </span>
            </div>
          </div>

          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${coachMode ? 'bg-amber-500' : 'bg-stone-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${coachMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </div>

        {/* Primary CTA Play Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 mt-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 active:scale-98 text-stone-950 font-black text-base sm:text-lg rounded-2xl shadow-2xl border border-amber-200 transition-all flex items-center justify-center gap-2"
        >
          {selectedMode === 'public' ? (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>Buscar Rival en Línea</span>
            </>
          ) : selectedMode === 'online_join' ? (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Unirse a la Mesa</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Comenzar Partida</span>
            </>
          )}
        </button>
      </div>

      {/* Footer credits */}
      <footer className="mt-2 text-center text-[10px] text-amber-200/50 font-medium">
        Tradición Criolla • Hecho en Argentina 🇦🇷
      </footer>

      {/* Modals */}
      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}
    </div>
  );
};
