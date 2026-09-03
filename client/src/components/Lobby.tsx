import React, { useEffect, useState } from 'react';
import { MatchConfig, BotDifficulty, loadPlayerStats, PlayerStats } from '@truco/core';
import {
  Bot,
  Globe,
  Play,
  Trophy,
  GraduationCap,
  Zap,
  User,
  Key,
  Swords
} from 'lucide-react';
import { StatsModal } from './StatsModal';
import { ThemeId } from '../themes/types';

export type GameMode = 'ai' | 'public' | 'online_create' | 'online_join';

interface LobbyProps {
  onStartAiGame: (config: MatchConfig, difficulty: BotDifficulty, playerName: string) => void;
  onStartMatchmaking: (config: MatchConfig, playerName: string) => void;
  onCreateOnlineRoom: (config: MatchConfig, playerName: string) => void;
  onJoinOnlineRoom: (roomId: string, playerName: string) => void;
  currentThemeId?: ThemeId;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartAiGame,
  onStartMatchmaking,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  currentThemeId: _currentThemeId
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
      p2Name: selectedMode === 'ai'
        ? `Bot ${aiDifficulty === 'canchero' ? 'Canchero' : aiDifficulty === 'intermedio' ? 'Gaucho' : 'Novato'}`
        : 'Rival'
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
    <div
      style={{
        backgroundColor: '#0a0503',
        backgroundImage: 'radial-gradient(ellipse at 50% 18%, rgba(35, 18, 5, 0.65), rgba(8, 4, 2, 0.95)), url(/themes/gaucho/table_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      className="w-full min-h-[100dvh] flex flex-col items-center justify-between p-3 sm:p-6 overflow-y-auto relative text-amber-100 pt-[max(env(safe-area-inset-top,0px),12px)] pb-[max(env(safe-area-inset-bottom,0px),16px)] selection:bg-amber-500 selection:text-stone-950 bg-[#0a0503]"
    >
      {/* Overhead Tavern Ambient Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/12 blur-[130px] pointer-events-none rounded-full"></div>

      {/* Top Utility Header Bar */}
      <header className="w-full max-w-lg flex items-center justify-end z-20 mb-1 sm:mb-2 px-1">
        {/* Stats Button */}
        <button
          onClick={() => {
            setStats(loadPlayerStats());
            setShowStats(true);
          }}
          className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-amber-500/50 text-amber-300 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          title="Ver estadísticas y récords"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[10px] sm:text-xs">Récords</span>
        </button>
      </header>

      {/* Hero Brand Section: Grand Title */}
      <div className="text-center my-2 sm:my-3 max-w-lg z-10 flex flex-col items-center">
        {/* Grand Chiseled Golden Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 tracking-tight font-serif drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          TRUCO ARGENTINO
        </h1>
        <p className="text-[11px] sm:text-xs text-amber-200/80 font-medium max-w-sm mt-1">
          Picardía, señas, mentiras criollas y tanteador tradicional
        </p>
      </div>

      {/* Main Luxury Wooden-Leather Form Card */}
      <div className="w-full max-w-md bg-stone-950/90 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-2 border-amber-500/40 flex flex-col gap-3.5 z-10 relative ring-1 ring-amber-400/20">
        {/* Section 1: Mode Selector (Mano a mano vs Bot, Pública en Línea, Mesa Privada) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/90 flex items-center gap-1">
              <Swords className="w-3 h-3 text-amber-400" />
              <span>Modalidad de Partida</span>
            </label>
            <span className="text-[9px] text-stone-400 font-mono">1 vs 1</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* Mode 1: vs Bot */}
            <button
              onClick={() => setSelectedMode('ai')}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center gap-1 border font-extrabold text-xs transition-all relative ${
                selectedMode === 'ai'
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 border-amber-200 shadow-[0_4px_15px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'bg-stone-900/70 text-stone-300 border-stone-800 hover:border-amber-700/60 hover:bg-stone-800/80'
              }`}
            >
              <div className={`p-1 rounded-xl ${selectedMode === 'ai' ? 'bg-stone-950/20' : 'bg-stone-800 text-amber-400'}`}>
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-black">vs Bot</span>
              <span className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-tight ${selectedMode === 'ai' ? 'text-stone-900' : 'text-stone-400'}`}>
                Práctica IA
              </span>
            </button>

            {/* Mode 2: Partida Pública */}
            <button
              onClick={() => setSelectedMode('public')}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center gap-1 border font-extrabold text-xs transition-all relative ${
                selectedMode === 'public'
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 border-amber-200 shadow-[0_4px_15px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'bg-stone-900/70 text-stone-300 border-stone-800 hover:border-amber-700/60 hover:bg-stone-800/80'
              }`}
            >
              {/* Online pulse indicator dot */}
              <div className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>

              <div className={`p-1 rounded-xl ${selectedMode === 'public' ? 'bg-stone-950/20' : 'bg-stone-800 text-amber-400'}`}>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <span className="text-[11px] sm:text-xs font-black">Pública</span>
              <span className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-tight ${selectedMode === 'public' ? 'text-stone-900' : 'text-emerald-400'}`}>
                Cola Rápida
              </span>
            </button>

            {/* Mode 3: Mesa Privada */}
            <button
              onClick={() => setSelectedMode(selectedMode.startsWith('online') ? selectedMode : 'online_create')}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center gap-1 border font-extrabold text-xs transition-all relative ${
                selectedMode.startsWith('online')
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 border-amber-200 shadow-[0_4px_15px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'bg-stone-900/70 text-stone-300 border-stone-800 hover:border-amber-700/60 hover:bg-stone-800/80'
              }`}
            >
              <div className={`p-1 rounded-xl ${selectedMode.startsWith('online') ? 'bg-stone-950/20' : 'bg-stone-800 text-amber-400'}`}>
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-black">Privada</span>
              <span className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-tight ${selectedMode.startsWith('online') ? 'text-stone-900' : 'text-stone-400'}`}>
                Con Amigos
              </span>
            </button>
          </div>
        </div>

        {/* Public Match info banner */}
        {selectedMode === 'public' && (
          <div className="p-2.5 rounded-2xl bg-amber-950/35 border border-amber-500/40 text-xs text-amber-200 animate-speech flex items-center gap-2.5 shadow-inner">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[11px] leading-tight">
              <strong>Matchmaking en la pulpería:</strong> Se te emparejará de inmediato con el próximo jugador que busque partida.
            </span>
          </div>
        )}

        {/* Online Private sub-tabs (Crear vs Unirse) */}
        {selectedMode.startsWith('online') && (
          <div className="flex bg-black/65 p-1 rounded-2xl border border-amber-900/60 animate-speech shadow-inner">
            <button
              onClick={() => setSelectedMode('online_create')}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
                selectedMode === 'online_create'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              Crear Sala Privada
            </button>
            <button
              onClick={() => setSelectedMode('online_join')}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
                selectedMode === 'online_join'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              Unirse con Código
            </button>
          </div>
        )}

        {/* Player Name Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1">
            <User className="w-3 h-3 text-amber-400" />
            <span>Tu Apodo en la Mesa</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={playerName}
              onChange={(e) => handlePlayerNameChange(e.target.value)}
              placeholder="Ingresá tu apodo"
              maxLength={15}
              className="w-full bg-black/60 border border-amber-700/60 rounded-xl px-3.5 py-2 text-amber-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-stone-500 shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 text-[10px] font-mono select-none">
              {playerName.length}/15
            </div>
          </div>
        </div>

        {/* Room Code for Online Join */}
        {selectedMode === 'online_join' && (
          <div className="flex flex-col gap-1 animate-speech">
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-400" />
              <span>Código de Sala (6 letras)</span>
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="EJ: ABC123"
              maxLength={6}
              className="w-full bg-black/70 border-2 border-amber-500/70 rounded-xl px-3.5 py-2 text-amber-200 text-center font-mono text-base sm:text-lg tracking-widest font-black focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-600 shadow-inner"
            />
          </div>
        )}

        {/* AI Difficulty Selector (When vs AI is selected) */}
        {selectedMode === 'ai' && (
          <div className="animate-speech">
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1 block">
              Personalidad del Rival
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['novato', 'intermedio', 'canchero'] as BotDifficulty[]).map((dif) => (
                <button
                  key={dif}
                  onClick={() => setAiDifficulty(dif)}
                  className={`py-2 px-1.5 rounded-2xl text-xs font-black border transition-all flex flex-col items-center gap-0.5 ${
                    aiDifficulty === dif
                      ? 'bg-gradient-to-b from-amber-600 to-amber-700 text-white border-amber-300 shadow-md ring-1 ring-amber-300 scale-[1.02]'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800 hover:border-amber-700/50 hover:bg-stone-800/80'
                  }`}
                >
                  <span className="text-base sm:text-lg">
                    {dif === 'canchero' ? '🕶️' : dif === 'intermedio' ? '🤠' : '🌱'}
                  </span>
                  <span className="capitalize font-black text-[11px] sm:text-xs">
                    {dif === 'canchero' ? 'Canchero' : dif === 'intermedio' ? 'Gaucho' : 'Novato'}
                  </span>
                  <span className="text-[8px] text-amber-200/60 font-normal">
                    {dif === 'canchero' ? 'Picante y bife' : dif === 'intermedio' ? 'Sereno' : 'Tranqui'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Match Settings: Points (30 vs 15) & Flor */}
        {selectedMode !== 'online_join' && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-900/50">
            {/* Puntos (30 vs 15) */}
            <div>
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1 block">
                Objetivo
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMaxScore(30)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center ${
                    maxScore === 30
                      ? 'bg-amber-600 text-stone-950 border-amber-300 font-extrabold shadow-md'
                      : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>30 Pts</span>
                  <span className="text-[8px] font-normal opacity-80">Completa</span>
                </button>
                <button
                  onClick={() => setMaxScore(15)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center ${
                    maxScore === 15
                      ? 'bg-amber-600 text-stone-950 border-amber-300 font-extrabold shadow-md'
                      : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>15 Pts</span>
                  <span className="text-[8px] font-normal opacity-80">Malas</span>
                </button>
              </div>
            </div>

            {/* Flor Criolla */}
            <div>
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300/80 mb-1 block">
                Flor Criolla
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setWithFlor(true)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center ${
                    withFlor
                      ? 'bg-amber-600 text-stone-950 border-amber-300 font-extrabold shadow-md'
                      : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>Con Flor</span>
                  <span className="text-[8px] font-normal opacity-80">3 del palo</span>
                </button>
                <button
                  onClick={() => setWithFlor(false)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center ${
                    !withFlor
                      ? 'bg-amber-600 text-stone-950 border-amber-300 font-extrabold shadow-md'
                      : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>Sin Flor</span>
                  <span className="text-[8px] font-normal opacity-80">A cara perro</span>
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
              ? 'bg-amber-950/40 border-amber-400/80 ring-1 ring-amber-400/40 shadow-inner'
              : 'bg-stone-900/50 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-colors ${coachMode ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'bg-stone-800 text-stone-400'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-200">Modo Aprendiz</span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">
                  Consejos en vivo
                </span>
              </div>
              <span className="text-[10px] text-stone-400 leading-tight">
                Glow en cartas recomendadas y sugerencias de Envido / Truco
              </span>
            </div>
          </div>

          {/* Toggle switch */}
          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${coachMode ? 'bg-amber-500' : 'bg-stone-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-stone-950 shadow-md transform transition-transform ${coachMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </div>

        {/* Primary CTA Play Button with 3D Emboss & Dynamic Action text */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 mt-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-stone-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.35)] border-2 border-amber-200 transition-all flex items-center justify-center gap-2.5"
        >
          {selectedMode === 'public' ? (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>Buscar Rival en Línea</span>
            </>
          ) : selectedMode === 'online_join' ? (
            <>
              <Key className="w-5 h-5 fill-current" />
              <span>Unirse a la Mesa</span>
            </>
          ) : selectedMode === 'online_create' ? (
            <>
              <Globe className="w-5 h-5" />
              <span>Crear Mesa Privada</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Sentarse a la Mesa</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-2 text-center text-[11px] text-amber-200/60 font-medium flex items-center justify-center gap-2 select-none">
        <span>Mano a mano sin 8s ni 9s</span>
        <span className="text-amber-500/40">•</span>
        <span>Desarrollado por <strong className="text-amber-300/90 font-semibold tracking-wide">nicosmico</strong></span>
      </footer>

      {/* Stats Modal */}
      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}
    </div>
  );
};
