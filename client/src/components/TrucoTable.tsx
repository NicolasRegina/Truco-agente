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
import { ScrollText, Trophy, Volume2, VolumeX, ArrowLeft, RefreshCw, Mic, MicOff, EyeOff, Palette, Flame } from 'lucide-react';
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

  const currentTheme = getTheme(themeId);

  const opponentId: PlayerId = myPlayerId === 'p1' ? 'p2' : 'p1';
  const myName = myPlayerId === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
  const oppName = opponentId === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');

  const myHand = state.hands[myPlayerId] || [];
  const oppHand = state.hands[opponentId] || [];
  const isMyTurn = state.turn === myPlayerId;

  // Climax / Tension state detection (Falta Envido or Vale Cuatro)
  const isTensionState =
    state.envido.currentCall === 'falta_envido' ||
    state.truco.currentLevel === 'vale_cuatro';

  // Spoken cantos & Sound effects
  useEffect(() => {
    if (state.logs.length > 0) {
      const lastLog = state.logs[state.logs.length - 1];
      if (lastLog.type === 'canto' && lastLog.text) {
        const cleanCanto = lastLog.text.replace(/^.*:\s*/, '');
        soundFx.speakCanto(cleanCanto);

        // If heavy bet, trigger heartbeat tension sound
        if (cleanCanto.toLowerCase().includes('falta envido') || cleanCanto.toLowerCase().includes('vale cuatro')) {
          soundFx.playTensionPulse();
        }
      } else if (lastLog.type === 'score') {
        soundFx.playScoreTally();
      } else if (lastLog.type === 'play') {
        soundFx.playCardSlam();
      }
    }
  }, [state.logs.length]);

  // Win fanfare & confetti
  useEffect(() => {
    if (state.matchWinner) {
      soundFx.playWinFanfare();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [state.matchWinner]);

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const toggleVoices = () => {
    soundFx.voicesEnabled = !voicesEnabled;
    setVoicesEnabled(!voicesEnabled);
  };

  const handleCardClick = (card: Card) => {
    if (isMyTurn && state.phase === 'waiting_action') {
      soundFx.playCardSlam();
      onAction({
        type: 'PLAY_CARD',
        player: myPlayerId,
        card,
        isCovered: coveredMode
      });
      setCoveredMode(false);
    }
  };

  // Get last speech bubble
  const getLastCanto = (pid: PlayerId): string | null => {
    const cantos = state.logs.filter(l => l.player === pid && (l.type === 'canto' || l.type === 'play'));
    return cantos.length > 0 ? cantos[cantos.length - 1].text.replace(/^.*:\s*/, '') : null;
  };

  const mySpeech = getLastCanto(myPlayerId);
  const oppSpeech = getLastCanto(opponentId);

  return (
    <div className={`relative w-full h-[100dvh] ${currentTheme.colors.tableOuter} flex flex-col justify-between overflow-hidden transition-colors duration-500`}>
      {/* Cinematic Tension Vignette Overlay */}
      {isTensionState && (
        <div className="absolute inset-0 bg-red-950/25 pointer-events-none z-20 animate-pulse border-4 border-red-600/50 shadow-[inset_0_0_100px_rgba(220,38,38,0.4)]"></div>
      )}

      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2 bg-black/50 backdrop-blur-md border-b border-amber-900/50 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-200 transition-colors shadow"
            title="Abandonar y Volver al Menú"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-xs sm:text-sm text-amber-400">TRUCO ARGENTINO</span>
              {isOnlineMultiplayer && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600/80 text-emerald-100 font-bold">
                  Online
                </span>
              )}
            </div>
            {roomId && (
              <span className="text-[10px] text-amber-200 font-mono">Sala: {roomId}</span>
            )}
          </div>
        </div>

        {/* Turn alert / Tension indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-black transition-all shadow-md flex items-center gap-1.5 ${
              isTensionState
                ? 'bg-red-600 text-white ring-2 ring-red-300 animate-bounce'
                : state.phase === 'match_ended'
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                : isMyTurn
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-stone-800 text-stone-300'
            }`}
          >
            {isTensionState && <Flame className="w-3.5 h-3.5 fill-current" />}
            <span>
              {state.phase === 'match_ended'
                ? 'Partida Terminada'
                : isTensionState
                ? '¡MÁXIMA TENSIÓN!'
                : state.phase === 'hand_ended'
                ? 'Mano Finalizada'
                : isMyTurn
                ? 'Tu Turno'
                : `Turno de ${oppName}`}
            </span>
          </div>
        </div>

        {/* Header Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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

      {/* Main Table Felt Arena (With overhead warm tavern spotlight) */}
      <main
        style={
          themeId === 'gaucho'
            ? {
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.85)), url(/themes/gaucho/table_bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : undefined
        }
        className={`flex-1 relative flex flex-col justify-between p-2 sm:p-4 ${currentTheme.colors.tableFelt} bg-felt-texture overflow-hidden transition-colors duration-500 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]`}
      >
        {/* Overhead tavern spotlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-400/15 blur-3xl pointer-events-none rounded-full"></div>

        {/* Opponent Area (Top) */}
        <div className="flex flex-col items-center gap-2 z-10">
          {/* Opponent Info & Speech Bubble */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-amber-800/50 text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300/40"></div>
              <span>{oppName}</span>
              {state.mano === opponentId && (
                <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 rounded font-black">Mano</span>
              )}
            </div>

            {oppSpeech && (
              <div className="px-3.5 py-1.5 bg-amber-100 text-stone-950 text-xs font-black rounded-2xl rounded-bl-none shadow-xl border border-amber-400 animate-speech">
                {oppSpeech}
              </div>
            )}
          </div>

          {/* Opponent Hand (Face down with theme pattern) */}
          <div className="flex items-center justify-center -space-x-4 sm:-space-x-6">
            {oppHand.map((card, i) => (
              <div key={i} className="hover:-translate-y-1 transition-transform">
                <CardView card={card} isFlipped={true} size="sm" themeId={themeId} />
              </div>
            ))}
          </div>
        </div>

        {/* Center Arena: Scoreboard & 3 Trick Zones */}
        <div className="flex-1 flex flex-col items-center justify-center my-1 z-10 w-full max-w-3xl mx-auto">
          {/* Floating Realistic Matchstick ScoreBoard */}
          <div className="mb-2 w-full max-w-xs sm:max-w-sm">
            <ScoreBoard
              score={state.score}
              maxScore={state.config.maxScore}
              p1Name={state.config.p1Name || 'P1'}
              p2Name={state.config.p2Name || 'P2'}
              mano={state.mano}
              turn={state.turn}
            />
          </div>

          {/* 3 Trick Drop Zones */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg px-2">
            {[0, 1, 2].map((trickIdx) => {
              const trick = state.tricks[trickIdx];
              const isCurrentTrick = state.currentTrickIndex === trickIdx;
              const winner = trick?.winner;

              return (
                <div
                  key={trickIdx}
                  className={`
                    p-1.5 sm:p-2 rounded-2xl bg-black/35 border flex flex-col items-center justify-center min-h-[95px] sm:min-h-[135px] relative transition-all shadow-inner
                    ${isCurrentTrick ? 'border-amber-400 bg-black/50 ring-2 ring-amber-400/40 shadow-lg scale-102' : 'border-amber-950/40'}
                  `}
                >
                  <span className="text-[10px] sm:text-xs font-black text-amber-300/90 mb-1 uppercase tracking-wider">
                    {trickIdx + 1}ª Mano
                  </span>

                  {/* Played cards in this trick with realistic angle tilt */}
                  <div className="flex items-center justify-center -space-x-3 sm:-space-x-4">
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
                    <div className="mt-1">
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider ${
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

        {/* Player Area (Bottom) */}
        <div className="flex flex-col items-center gap-1 z-10 pb-1">
          {/* Player info & speech */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-amber-800/50 text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40"></div>
              <span>{myName} (Tú)</span>
              {state.mano === myPlayerId && (
                <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 rounded font-black">Mano</span>
              )}
            </div>

            {mySpeech && (
              <div className="px-3.5 py-1.5 bg-amber-100 text-stone-950 text-xs font-black rounded-2xl rounded-br-none shadow-xl border border-amber-400 animate-speech">
                {mySpeech}
              </div>
            )}

            {/* Carta Tapada Toggle Button */}
            {isMyTurn && state.phase === 'waiting_action' && (
              <button
                onClick={() => setCoveredMode(!coveredMode)}
                className={`px-3 py-1 rounded-full text-xs font-black border transition-all flex items-center gap-1 shadow ${
                  coveredMode
                    ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400 animate-pulse'
                    : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:bg-stone-800'
                }`}
                title="Tirar carta boca abajo"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{coveredMode ? 'Tapada Activa' : 'Jugar Tapada'}</span>
              </button>
            )}
          </div>

          {/* 3D Ergonomic Fan Hand */}
          <FanHand
            cards={myHand}
            isMyTurn={isMyTurn}
            canPlay={state.phase === 'waiting_action'}
            onPlayCard={handleCardClick}
            coveredMode={coveredMode}
            themeId={themeId}
          />

          {/* Context Action Bar */}
          <ActionBar
            state={state}
            player={myPlayerId}
            onAction={onAction}
            disabled={!isMyTurn}
          />
        </div>

        {/* Bottom Left Corner: Interactive Criollo Mate */}
        <div className="absolute bottom-3 left-3 z-30">
          <InteractiveMate />
        </div>

        {/* Bottom Right Corner: Emote Wheel Button */}
        <div className="absolute bottom-3 right-3 z-30">
          <ChatEmotes onSendMessage={onSendChat} />
        </div>
      </main>

      {/* Hand Ended / Next Hand Modal Overlay */}
      {state.phase === 'hand_ended' && !state.matchWinner && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-speech">
          <div className="bg-wood-border p-6 rounded-3xl max-w-sm w-full text-center text-amber-100 border border-amber-500/50 shadow-2xl">
            <h3 className="text-2xl font-black text-amber-400 mb-1 font-serif">Mano Finalizada</h3>
            <p className="text-sm text-stone-200 mb-5">
              {state.handWinner === myPlayerId ? '¡Ganaste la mano!' : `La mano fue para ${oppName}`}
            </p>

            <button
              onClick={onNextHand}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-black text-base rounded-2xl shadow-xl border border-amber-300 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Siguiente Mano
            </button>
          </div>
        </div>
      )}

      {/* Match Ended Modal Overlay */}
      {state.matchWinner && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-speech">
          <div className="bg-wood-border p-6 sm:p-8 rounded-3xl max-w-md w-full text-center text-amber-100 border-2 border-amber-400 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-9 h-9 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1 font-serif">
              {state.matchWinner === myPlayerId ? '¡FELICITACIONES, GANASTE!' : '¡PARTIDA FINALIZADA!'}
            </h2>
            <p className="text-sm text-stone-300 mb-5">
              Ganador de la mesa: <strong className="text-amber-400">{state.matchWinner === 'p1' ? state.config.p1Name || 'P1' : state.config.p2Name || 'P2'}</strong>
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={onRestartMatch}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all"
              >
                Revancha
              </button>
              <button
                onClick={onBackToLobby}
                className="py-3.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm sm:text-base rounded-2xl border border-stone-600 transition-all"
              >
                Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Log Drawer */}
      {showLogs && (
        <div className="absolute top-14 right-3 w-80 max-h-[70vh] bg-stone-900/95 backdrop-blur-md border border-amber-600/40 rounded-2xl shadow-2xl p-4 z-40 flex flex-col animate-speech">
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
