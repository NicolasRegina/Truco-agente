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
import { soundFx } from '../utils/soundController';
import { ScrollText, Trophy, Volume2, VolumeX, ArrowLeft, RefreshCw, Mic, MicOff, EyeOff } from 'lucide-react';
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
  roomId
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voicesEnabled, setVoicesEnabled] = useState(true);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [coveredMode, setCoveredMode] = useState(false);

  const opponentId: PlayerId = myPlayerId === 'p1' ? 'p2' : 'p1';
  const myName = myPlayerId === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');
  const oppName = opponentId === 'p1' ? (state.config.p1Name || 'Jugador 1') : (state.config.p2Name || 'Jugador 2');

  const myHand = state.hands[myPlayerId] || [];
  const oppHand = state.hands[opponentId] || [];
  const isMyTurn = state.turn === myPlayerId;

  // Speak cantos when state logs update
  useEffect(() => {
    if (state.logs.length > 0) {
      const lastLog = state.logs[state.logs.length - 1];
      if (lastLog.type === 'canto' && lastLog.text) {
        const cleanCanto = lastLog.text.replace(/^.*:\s*/, '');
        soundFx.speakCanto(cleanCanto);
      } else if (lastLog.type === 'score') {
        soundFx.playScoreTally();
      }
    }
  }, [state.logs.length]);

  // Trigger win confetti
  useEffect(() => {
    if (state.matchWinner) {
      soundFx.playWinFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
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

  const handleCardClick = (card: Card, isCovered: boolean = false) => {
    if (isMyTurn && state.phase === 'waiting_action') {
      soundFx.playCardSnap();
      onAction({
        type: 'PLAY_CARD',
        player: myPlayerId,
        card,
        isCovered
      });
      setCoveredMode(false);
    }
  };

  // Get last canto speech for each player
  const getLastCanto = (pid: PlayerId): string | null => {
    const cantos = state.logs.filter(l => l.player === pid && (l.type === 'canto' || l.type === 'play'));
    return cantos.length > 0 ? cantos[cantos.length - 1].text.replace(/^.*:\s*/, '') : null;
  };

  const mySpeech = getLastCanto(myPlayerId);
  const oppSpeech = getLastCanto(opponentId);

  return (
    <div className="relative w-full h-[100dvh] bg-felt-dark flex flex-col justify-between overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2 bg-black/40 backdrop-blur-md border-b border-amber-900/40 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-200 transition-colors"
            title="Abandonar y Volver al Lobby"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-amber-400">TRUCO ARGENTINO</span>
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

        {/* Turn alert */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md ${
              state.phase === 'match_ended'
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                : isMyTurn
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-stone-800 text-stone-300'
            }`}
          >
            {state.phase === 'match_ended'
              ? 'Partida Terminada'
              : state.phase === 'hand_ended'
              ? 'Mano Finalizada'
              : isMyTurn
              ? 'Tu Turno'
              : `Turno de ${oppName}`}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleVoices}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              voicesEnabled ? 'bg-amber-900/60 text-amber-300' : 'bg-stone-800 text-stone-400'
            }`}
            title={voicesEnabled ? 'Voces activadas' : 'Voces silenciadas'}
          >
            {voicesEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-200"
            title="Efectos de Sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="p-1.5 sm:p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-200"
            title="Historial de cantos"
          >
            <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 relative flex flex-col justify-between p-2 sm:p-4 bg-felt-texture overflow-hidden">
        {/* Opponent Area (Top) */}
        <div className="flex flex-col items-center gap-2 z-10">
          {/* Opponent Info & Speech */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-amber-800/40 text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span>{oppName}</span>
              {state.mano === opponentId && (
                <span className="text-[10px] bg-amber-500 text-stone-950 px-1 rounded font-extrabold">Mano</span>
              )}
            </div>

            {oppSpeech && (
              <div className="px-3 py-1 bg-amber-100 text-stone-950 text-xs font-extrabold rounded-2xl rounded-bl-none shadow-lg border border-amber-400 animate-speech">
                {oppSpeech}
              </div>
            )}
          </div>

          {/* Opponent Hand (Face down) */}
          <div className="flex items-center justify-center -space-x-4 sm:-space-x-6">
            {oppHand.map((card, i) => (
              <CardView key={i} card={card} isFlipped={true} size="sm" />
            ))}
          </div>
        </div>

        {/* Center Arena: Trick Play Zones */}
        <div className="flex-1 flex flex-col items-center justify-center my-1 z-10 w-full max-w-3xl mx-auto">
          {/* Floating ScoreBoard Widget */}
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

          {/* 3 Tricks Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg px-2">
            {[0, 1, 2].map((trickIdx) => {
              const trick = state.tricks[trickIdx];
              const isCurrentTrick = state.currentTrickIndex === trickIdx;
              const winner = trick?.winner;

              return (
                <div
                  key={trickIdx}
                  className={`
                    p-1.5 sm:p-2 rounded-xl bg-black/25 border flex flex-col items-center justify-center min-h-[90px] sm:min-h-[130px] relative transition-all
                    ${isCurrentTrick ? 'border-amber-400/80 bg-black/40 ring-2 ring-amber-400/30' : 'border-amber-950/30'}
                  `}
                >
                  <span className="text-[10px] sm:text-xs font-bold text-amber-300/80 mb-1">
                    {trickIdx + 1}ª Mano
                  </span>

                  {/* Played cards in this trick */}
                  <div className="flex items-center justify-center -space-x-3 sm:-space-x-4">
                    {trick?.cards.map((pc, cIdx) => (
                      <div
                        key={cIdx}
                        className={`transition-transform ${cIdx === 0 ? '-rotate-6' : 'rotate-6'}`}
                      >
                        <CardView card={pc.card} size="sm" />
                      </div>
                    ))}
                  </div>

                  {/* Trick Winner Badge */}
                  {winner && (
                    <div className="mt-1">
                      <span
                        className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow ${
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

        {/* Player Hand & Controls (Bottom) */}
        <div className="flex flex-col items-center gap-2 z-10 pb-1">
          {/* Player info & speech */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-amber-800/40 text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>{myName} (Tú)</span>
              {state.mano === myPlayerId && (
                <span className="text-[10px] bg-amber-500 text-stone-950 px-1 rounded font-extrabold">Mano</span>
              )}
            </div>

            {mySpeech && (
              <div className="px-3 py-1 bg-amber-100 text-stone-950 text-xs font-extrabold rounded-2xl rounded-br-none shadow-lg border border-amber-400 animate-speech">
                {mySpeech}
              </div>
            )}

            {/* Carta Tapada Toggle Button */}
            {isMyTurn && state.phase === 'waiting_action' && (
              <button
                onClick={() => setCoveredMode(!coveredMode)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                  coveredMode
                    ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400 animate-pulse'
                    : 'bg-stone-900/80 text-stone-300 border-stone-700 hover:bg-stone-800'
                }`}
                title="Tirar carta boca abajo / al bulto"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{coveredMode ? 'Tapada Activa' : 'Jugar Tapada'}</span>
              </button>
            )}
          </div>

          {/* Player Hand Cards */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {myHand.map((card) => {
              const playable = isMyTurn && state.phase === 'waiting_action';
              return (
                <div key={card.id} className="animate-deal">
                  <CardView
                    card={card}
                    isPlayable={playable}
                    onClick={() => handleCardClick(card, coveredMode)}
                    size="md"
                    selected={coveredMode}
                  />
                </div>
              );
            })}
          </div>

          {/* Context Action Bar */}
          <ActionBar
            state={state}
            player={myPlayerId}
            onAction={onAction}
            disabled={!isMyTurn}
          />
        </div>

        {/* Bottom Bar Emote Wheel Button */}
        <div className="absolute bottom-3 right-3 z-30">
          <ChatEmotes onSendMessage={onSendChat} />
        </div>
      </main>

      {/* Hand Ended / Next Hand Modal Overlay */}
      {state.phase === 'hand_ended' && !state.matchWinner && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-speech">
          <div className="bg-wood-border p-6 rounded-2xl max-w-sm w-full text-center text-amber-100 border border-amber-500/50 shadow-2xl">
            <h3 className="text-xl font-extrabold text-amber-400 mb-1">Mano Finalizada</h3>
            <p className="text-sm text-stone-200 mb-4">
              {state.handWinner === myPlayerId ? '¡Ganaste la mano!' : `La mano fue para ${oppName}`}
            </p>

            <button
              onClick={onNextHand}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-extrabold text-base rounded-xl shadow-lg border border-amber-300 transition-all flex items-center justify-center gap-2"
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
          <div className="bg-wood-border p-6 rounded-3xl max-w-md w-full text-center text-amber-100 border-2 border-amber-400 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-9 h-9 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
              {state.matchWinner === myPlayerId ? '¡FELICITACIONES, GANASTE!' : '¡PARTIDA FINALIZADA!'}
            </h2>
            <p className="text-sm text-stone-300 mb-4">
              Ganador: <strong className="text-amber-400">{state.matchWinner === 'p1' ? state.config.p1Name || 'P1' : state.config.p2Name || 'P2'}</strong>
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={onRestartMatch}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-all"
              >
                Revancha
              </button>
              <button
                onClick={onBackToLobby}
                className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm sm:text-base rounded-xl border border-stone-600 transition-all"
              >
                Lobby
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
    </div>
  );
};
