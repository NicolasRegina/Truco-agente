import React, { useEffect, useState } from 'react';
import {
  Card,
  GameAction,
  GameState,
  HandLogEntry,
  PlayerId
} from '@truco/core';
import { CardView } from './CardView';
import { ScoreBoard } from './ScoreBoard';
import { ActionBar } from './ActionBar';
import { ChatEmotes } from './ChatEmotes';
import { ConfirmModal } from './ConfirmModal';
import { ThemeStoreModal } from './ThemeStoreModal';
import { InteractiveMate } from './InteractiveMate';
import { FanHand } from './FanHand';
import { ThemeId } from '../themes/types';
import { getTheme } from '../themes/themeRegistry';
import { soundFx } from '../utils/soundController';
import { getCoachAdvice, CoachAdvice } from '../utils/coachEngine';
import {
  ScrollText,
  Trophy,
  Volume2,
  VolumeX,
  ArrowLeft,
  RefreshCw,
  Mic,
  MicOff,
  EyeOff,
  Palette,
  Flame,
  GraduationCap,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrucoTableProps {
  state: GameState;
  myPlayerId: PlayerId;
  onAction: (action: GameAction) => void;
  onNextHand: () => void;
  onRestartMatch: () => void;
  onBackToLobby: () => void;
  onSendChat: (text: string) => void;
  isOnlineMultiplayer?: boolean;
  roomId?: string;
  themeId: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

export const TrucoTable: React.FC<TrucoTableProps> = ({
  state,
  myPlayerId,
  onAction,
  onNextHand,
  onRestartMatch,
  onBackToLobby,
  onSendChat,
  isOnlineMultiplayer = false,
  roomId,
  themeId,
  onThemeChange
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voicesEnabled, setVoicesEnabled] = useState(true);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showThemeStore, setShowThemeStore] = useState(false);
  const [coveredMode, setCoveredMode] = useState(false);

  // Modo Aprendiz (Coach Criollo)
  const [coachMode, setCoachMode] = useState(() => {
    return localStorage.getItem('truco_coach_mode') === 'true';
  });
  const [coachAdvice, setCoachAdvice] = useState<CoachAdvice | null>(null);

  const currentTheme = getTheme(themeId);

  const opponentId: PlayerId = myPlayerId === 'p1' ? 'p2' : 'p1';
  const myName = myPlayerId === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
  const oppName = opponentId === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');

  const myHand = state.hands[myPlayerId] || [];
  const oppHand = state.hands[opponentId] || [];

  const isMyTurn = state.turn === myPlayerId;

  // Toggle coach mode and persist
  const toggleCoachMode = () => {
    setCoachMode(prev => {
      const next = !prev;
      localStorage.setItem('truco_coach_mode', String(next));
      if (!next) setCoachAdvice(null);
      return next;
    });
  };

  // Coach advice evaluation on idle (2.2s after turn starts)
  useEffect(() => {
    if (!coachMode || !isMyTurn || state.phase === 'hand_ended' || state.phase === 'match_ended') {
      setCoachAdvice(null);
      return;
    }

    const timer = setTimeout(() => {
      const advice = getCoachAdvice(state, myPlayerId);
      setCoachAdvice(advice);
    }, 2200);

    return () => clearTimeout(timer);
  }, [
    coachMode,
    isMyTurn,
    state.phase,
    state.currentTrickIndex,
    state.hands[myPlayerId]?.length,
    state.envido.isResolved,
    state.truco.currentLevel
  ]);

  // Clear advice once player plays
  const handleAction = (action: GameAction) => {
    setCoachAdvice(null);
    onAction(action);
  };

  // High tension state detection
  const isTensionState =
    state.truco.currentLevel === 'retruco' ||
    state.truco.currentLevel === 'vale_cuatro' ||
    state.envido.currentCall === 'falta_envido' ||
    (state.score.p1 >= 26 && state.score.p2 >= 26);

  // Play tension sound on high-stakes phases
  useEffect(() => {
    if (isTensionState) {
      soundFx.playTensionPulse();
    }
  }, [isTensionState]);

  // Voice announces cantos & plays
  useEffect(() => {
    if (!voicesEnabled) return;
    const lastLog = state.logs[state.logs.length - 1];
    if (lastLog && lastLog.type === 'canto') {
      soundFx.speakCanto(lastLog.text);
    }
  }, [state.logs, voicesEnabled]);

  // Sound effects on score updates
  useEffect(() => {
    if (state.score.p1 > 0 || state.score.p2 > 0) {
      soundFx.playScoreTally();
    }
  }, [state.score.p1, state.score.p2]);

  // Trigger celebration confetti on victory
  useEffect(() => {
    if (state.matchWinner) {
      if (state.matchWinner === myPlayerId) {
        soundFx.playWinFanfare();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  }, [state.matchWinner, myPlayerId]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
  };

  const toggleVoices = () => {
    setVoicesEnabled(!voicesEnabled);
  };

  const handleCardClick = (card: Card) => {
    if (!isMyTurn || state.phase !== 'waiting_action') return;
    soundFx.playCardSlam();
    setCoachAdvice(null);
    onAction({
      type: 'PLAY_CARD',
      player: myPlayerId,
      card,
      isCovered: coveredMode
    });
    setCoveredMode(false);
  };

  const lastOpponentAction = state.logs
    .slice()
    .reverse()
    .find((log: HandLogEntry) => log.player === opponentId);
  const oppSpeech = lastOpponentAction ? lastOpponentAction.text : null;

  const lastMyAction = state.logs
    .slice()
    .reverse()
    .find((log: HandLogEntry) => log.player === myPlayerId);
  const mySpeech = lastMyAction ? lastMyAction.text : null;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-stone-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Dynamic Ambient Atmosphere: Tension vignette glow */}
      {isTensionState && (
        <div className="absolute inset-0 bg-red-950/25 pointer-events-none z-20 animate-pulse border-4 border-red-600/50 shadow-[inset_0_0_100px_rgba(220,38,38,0.4)]"></div>
      )}

      {/* Top Header Bar with Safe-Area top padding for iPhone Notch / Dynamic Island */}
      <header className="flex items-center justify-between px-2.5 sm:px-6 pt-[max(env(safe-area-inset-top,0px),10px)] pb-1.5 bg-black/65 backdrop-blur-md border-b border-amber-900/50 z-30 shadow-md shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-200 transition-colors shadow"
            title="Abandonar y Volver al Menú"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif font-black text-xs sm:text-sm text-amber-400">TRUCO ARGENTINO</span>
              {isOnlineMultiplayer && (
                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600/80 text-emerald-100 font-bold">
                  Online
                </span>
              )}
            </div>
            {roomId && (
              <span className="text-[9px] sm:text-[10px] text-amber-200 font-mono">Sala: {roomId}</span>
            )}
          </div>
        </div>

        {/* Turn alert / Tension indicator */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black transition-all shadow-md flex items-center gap-1 sm:gap-1.5 ${
              isTensionState
                ? 'bg-red-600 text-white ring-2 ring-red-300 animate-bounce'
                : state.phase === 'match_ended'
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                : isMyTurn
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-stone-800 text-stone-300'
            }`}
          >
            {isTensionState && <Flame className="w-3 h-3 fill-current" />}
            <span>
              {state.phase === 'match_ended'
                ? 'Finalizada'
                : isTensionState
                ? '¡TENSIÓN!'
                : state.phase === 'hand_ended'
                ? 'Mano Fin'
                : isMyTurn
                ? 'Tu Turno'
                : `Turno de ${oppName}`}
            </span>
          </div>
        </div>

        {/* Header Action icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Modo Aprendiz Toggle Button */}
          <button
            onClick={toggleCoachMode}
            className={`p-1.5 sm:p-2 rounded-xl transition-all shadow flex items-center gap-1 ${
              coachMode
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 font-bold'
                : 'bg-stone-800/80 text-stone-400 hover:text-amber-200'
            }`}
            title={coachMode ? 'Modo Aprendiz Activado' : 'Activar Modo Aprendiz'}
          >
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline text-xs">Aprendiz</span>
          </button>

          <button
            onClick={() => setShowThemeStore(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-200 transition-colors shadow"
            title="Temas y Skins"
          >
            <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={toggleVoices}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors shadow ${
              voicesEnabled ? 'bg-amber-900/60 text-amber-300' : 'bg-stone-800 text-stone-400'
            }`}
            title={voicesEnabled ? 'Voces activadas' : 'Voces silenciadas'}
          >
            {voicesEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-200 shadow"
            title="Efectos de Sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-200 shadow"
            title="Historial de cantos"
          >
            <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Main Table Felt Arena */}
      <main
        style={
          themeId === 'gaucho'
            ? {
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.88)), url(/themes/gaucho/table_bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : undefined
        }
        className={`flex-1 relative flex flex-col justify-between p-1.5 sm:p-3 ${currentTheme.colors.tableFelt} bg-felt-texture overflow-hidden transition-colors duration-500 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]`}
      >
        {/* Overhead tavern spotlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[250px] bg-amber-400/15 blur-3xl pointer-events-none rounded-full"></div>

        {/* Opponent Area (Top) */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10">
          {/* Opponent Info & Speech Bubble */}
          <div className="flex items-center gap-1.5">
            <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-black/60 backdrop-blur-md rounded-full border border-amber-800/50 text-[11px] sm:text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-300/40"></div>
              <span>{oppName}</span>
              {state.mano === opponentId && (
                <span className="text-[9px] bg-amber-500 text-stone-950 px-1 rounded font-black">Mano</span>
              )}
            </div>

            {oppSpeech && (
              <div className="px-3 py-1 bg-amber-100 text-stone-950 text-[11px] sm:text-xs font-black rounded-2xl rounded-bl-none shadow-xl border border-amber-400 animate-speech">
                {oppSpeech}
              </div>
            )}
          </div>

          {/* Opponent Hand */}
          <div className="flex items-center justify-center -space-x-3 sm:-space-x-5">
            {oppHand.map((card, i) => (
              <div key={i} className="hover:-translate-y-1 transition-transform">
                <CardView card={card} isFlipped={true} size="sm" themeId={themeId} />
              </div>
            ))}
          </div>
        </div>

        {/* Center Arena: Scoreboard & 3 Trick Zones */}
        <div className="flex-1 flex flex-col items-center justify-center my-0.5 sm:my-1 z-10 w-full max-w-2xl mx-auto">
          {/* ScoreBoard */}
          <div className="mb-1 sm:mb-2 w-full max-w-xs sm:max-w-sm">
            <ScoreBoard
              score={state.score}
              maxScore={state.config.maxScore}
              p1Name={state.config.p1Name || 'P1'}
              p2Name={state.config.p2Name || 'P2'}
              mano={state.mano}
              turn={state.turn}
            />
          </div>

          {/* 3 Trick Drop Zones (Compact on Mobile) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full max-w-md px-1 sm:px-2">
            {[0, 1, 2].map((trickIdx) => {
              const trick = state.tricks[trickIdx];
              const isCurrentTrick = state.currentTrickIndex === trickIdx;
              const winner = trick?.winner;

              return (
                <div
                  key={trickIdx}
                  className={`
                    p-1 sm:p-2 rounded-xl sm:rounded-2xl bg-black/40 border flex flex-col items-center justify-center min-h-[64px] sm:min-h-[105px] relative transition-all shadow-inner
                    ${isCurrentTrick ? 'border-amber-400 bg-black/55 ring-1 sm:ring-2 ring-amber-400/40 shadow-lg scale-102' : 'border-amber-950/40'}
                  `}
                >
                  <span className="text-[9px] sm:text-xs font-black text-amber-300/90 mb-0.5 uppercase tracking-wider">
                    {trickIdx + 1}ª Mano
                  </span>

                  {/* Played cards in this trick with realistic angle tilt */}
                  <div className="flex items-center justify-center -space-x-2.5 sm:-space-x-4">
                    {trick?.cards.map((pc, cIdx) => (
                      <div
                        key={cIdx}
                        className={`transition-transform duration-300 ${cIdx === 0 ? '-rotate-6 translate-y-0.5' : 'rotate-6 -translate-y-0.5'}`}
                      >
                        <CardView card={pc.card} size="sm" themeId={themeId} />
                      </div>
                    ))}
                  </div>

                  {/* Trick Winner Badge */}
                  {winner && (
                    <div className="mt-0.5 sm:mt-1">
                      <span
                        className={`text-[8px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-md uppercase tracking-wider ${
                          winner === 'parda'
                            ? 'bg-stone-600 text-stone-100'
                            : winner === myPlayerId
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {winner === 'parda' ? 'Parda' : winner === myPlayerId ? 'Ganaste' : 'Perdiste'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Area (Bottom with safe-area padding for iPhone Home Indicator) */}
        <div className="flex flex-col items-center gap-0.5 z-10 pb-[max(env(safe-area-inset-bottom,0px),8px)]">
          {/* Coach Advice Floating Bubble / Snackbar (Modo Aprendiz) */}
          {coachAdvice && (
            <div className="mb-1 mx-auto max-w-sm px-3 py-1.5 bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 border-2 border-amber-400 text-amber-100 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-speech z-40 backdrop-blur-md">
              <div className="p-1 rounded-lg bg-amber-400 text-stone-950 shrink-0 shadow">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-300 text-xs truncate">{coachAdvice.title}</span>
                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase font-bold">
                    {coachAdvice.badge}
                  </span>
                </div>
                <span className="text-[10px] text-stone-300 leading-tight block truncate">
                  {coachAdvice.explanation}
                </span>
              </div>
              <button
                onClick={() => setCoachAdvice(null)}
                className="p-1 text-stone-400 hover:text-white transition-colors"
                title="Cerrar consejo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Player info & speech */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-black/60 backdrop-blur-md rounded-full border border-amber-800/50 text-[11px] sm:text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40"></div>
              <span>{myName} (Tú)</span>
              {state.mano === myPlayerId && (
                <span className="text-[9px] bg-amber-500 text-stone-950 px-1 rounded font-black">Mano</span>
              )}
            </div>

            {mySpeech && (
              <div className="px-3 py-1 bg-amber-100 text-stone-950 text-[11px] sm:text-xs font-black rounded-2xl rounded-br-none shadow-xl border border-amber-400 animate-speech">
                {mySpeech}
              </div>
            )}

            {/* Carta Tapada Toggle Button */}
            {isMyTurn && state.phase === 'waiting_action' && (
              <button
                onClick={() => setCoveredMode(!coveredMode)}
                className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-black border transition-all flex items-center gap-1 shadow ${
                  coveredMode
                    ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400 animate-pulse'
                    : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:bg-stone-800'
                }`}
                title="Tirar carta boca abajo"
              >
                <EyeOff className="w-3 h-3" />
                <span>{coveredMode ? 'Tapada' : 'Jugar Tapada'}</span>
              </button>
            )}
          </div>

          {/* 3D Ergonomic Fan Hand (with Coach Recommendation Glow) */}
          <FanHand
            cards={myHand}
            isMyTurn={isMyTurn}
            canPlay={state.phase === 'waiting_action'}
            onPlayCard={handleCardClick}
            coveredMode={coveredMode}
            themeId={themeId}
            recommendedCardId={coachAdvice?.recommendedCardId}
          />

          {/* Context Action Bar (with Coach Recommendation Pulse) */}
          <ActionBar
            state={state}
            player={myPlayerId}
            onAction={handleAction}
            disabled={!isMyTurn}
            recommendedAction={coachAdvice?.recommendedAction}
          />
        </div>

        {/* Left Side: Interactive Criollo Mate (Positioned above action bar on mobile) */}
        <div className="absolute bottom-20 sm:bottom-4 left-2 sm:left-4 z-30 scale-85 sm:scale-100 origin-bottom-left">
          <InteractiveMate />
        </div>

        {/* Right Side: Emote Wheel Button (Positioned above action bar on mobile) */}
        <div className="absolute bottom-20 sm:bottom-4 right-2 sm:right-4 z-30 scale-85 sm:scale-100 origin-bottom-right">
          <ChatEmotes onSendMessage={onSendChat} />
        </div>
      </main>

      {/* Hand Ended / Next Hand Modal Overlay */}
      {state.phase === 'hand_ended' && !state.matchWinner && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-speech">
          <div className="bg-wood-border p-5 sm:p-6 rounded-3xl max-w-sm w-full text-center text-amber-100 border border-amber-500/50 shadow-2xl">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 mb-1 font-serif">Mano Finalizada</h3>
            <p className="text-xs sm:text-sm text-stone-200 mb-4">
              {state.handWinner === myPlayerId ? '¡Ganaste la mano!' : `La mano fue para ${oppName}`}
            </p>

            <button
              onClick={onNextHand}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl border border-amber-300 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Siguiente Mano
            </button>
          </div>
        </div>
      )}

      {/* Match Ended Modal Overlay */}
      {state.matchWinner && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-speech">
          <div className="bg-wood-border p-6 sm:p-8 rounded-3xl max-w-md w-full text-center text-amber-100 border-2 border-amber-400 shadow-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400" />
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-amber-300 mb-1 font-serif">
              {state.matchWinner === myPlayerId ? '¡FELICITACIONES, GANASTE!' : '¡PARTIDA FINALIZADA!'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mb-4">
              Ganador de la mesa: <strong className="text-amber-400">{state.matchWinner === 'p1' ? state.config.p1Name || 'P1' : state.config.p2Name || 'P2'}</strong>
            </p>

            <div className="flex gap-2.5 sm:gap-3 mt-4">
              <button
                onClick={onRestartMatch}
                className="flex-1 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black text-xs sm:text-base rounded-2xl shadow-xl transition-all"
              >
                Revancha
              </button>
              <button
                onClick={onBackToLobby}
                className="py-3 sm:py-3.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-base rounded-2xl border border-stone-600 transition-all"
              >
                Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Log Drawer */}
      {showLogs && (
        <div className="absolute top-14 right-2 sm:right-3 w-72 sm:w-80 max-h-[70vh] bg-stone-900/95 backdrop-blur-md border border-amber-600/40 rounded-2xl shadow-2xl p-3 sm:p-4 z-40 flex flex-col animate-speech">
          <div className="flex items-center justify-between border-b border-stone-700 pb-2 mb-2">
            <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <ScrollText className="w-4 h-4" /> Historial de Jugadas
            </span>
            <button onClick={() => setShowLogs(false)} className="text-stone-400 hover:text-white text-xs">
              Cerrar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 text-xs pr-1">
            {state.logs.map((log: HandLogEntry, i: number) => (
              <div
                key={i}
                className={`p-1.5 rounded ${
                  log.type === 'canto'
                    ? 'bg-amber-950/40 text-amber-300 font-semibold'
                    : log.type === 'score'
                    ? 'bg-emerald-950/40 text-emerald-300 font-bold'
                    : 'bg-stone-800/50 text-stone-300'
                }`}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Quit Modal */}
      {showQuitConfirm && (
        <ConfirmModal
          title="¿Abandonar partida?"
          message="Si salís ahora, se dará por perdida la partida actual."
          confirmLabel="Abandonar"
          cancelLabel="Continuar Jugando"
          onConfirm={() => {
            setShowQuitConfirm(false);
            onBackToLobby();
          }}
          onCancel={() => setShowQuitConfirm(false)}
        />
      )}

      {/* Theme Store Modal */}
      {showThemeStore && (
        <ThemeStoreModal
          currentThemeId={themeId}
          onSelectTheme={(id) => {
            onThemeChange(id);
          }}
          onClose={() => setShowThemeStore(false)}
        />
      )}
    </div>
  );
};
