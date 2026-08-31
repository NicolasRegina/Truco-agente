import React, { useState } from 'react';
import { Copy, Check, Share2, ArrowLeft, Loader2, Users } from 'lucide-react';
import { MatchConfig } from '@truco/core';

interface WaitingRoomProps {
  roomId: string;
  config: MatchConfig;
  playerName: string;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  roomId,
  config,
  playerName,
  onCancel
}) => {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/?room=${roomId}`;
  const whatsappText = encodeURIComponent(
    `¡Che! Te invito a una partida de Truco Argentino online. Entrá directo acá: ${inviteUrl} o poné el código ${roomId}`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsapp = () => {
    window.open(`https://api.whatsapp.com/send?text=${whatsappText}`, '_blank');
  };

  return (
    <div className="min-h-[100dvh] bg-felt-dark flex flex-col items-center justify-center p-4">
      <div className="bg-wood-border max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/60 text-center text-amber-100 flex flex-col items-center gap-5 animate-speech">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase">
          <Users className="w-3.5 h-3.5" /> Sala Online Creada
        </div>

        {/* Pulse radar animation */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center animate-ping absolute inset-0"></div>
          <div className="w-20 h-20 rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center relative shadow-lg">
            <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-300">
            Esperando a tu rival...
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Compartí este código o el enlace directo para que tu amigo se una a la mesa.
          </p>
        </div>

        {/* Giant Room Code Display */}
        <div className="w-full bg-black/50 border-2 border-amber-500/80 rounded-2xl p-4 flex flex-col items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/80">
            Código de Sala
          </span>
          <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-amber-200">
            {roomId}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-2.5">
          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg border border-amber-300 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-950" /> : <Copy className="w-5 h-5" />}
            {copied ? '¡Código Copiado!' : 'Copiar Código'}
          </button>

          <button
            onClick={handleShareWhatsapp}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg border border-emerald-400/60 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Invitar por WhatsApp
          </button>
        </div>

        {/* Room Info details */}
        <div className="flex items-center justify-between w-full text-xs text-stone-300 border-t border-amber-900/50 pt-3 px-2">
          <span>Creador: <strong className="text-amber-200">{playerName}</strong></span>
          <span>A {config.maxScore} pts {config.withFlor ? '(Con Flor)' : '(Sin Flor)'}</span>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1 mt-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Cancelar y Volver
        </button>
      </div>
    </div>
  );
};
