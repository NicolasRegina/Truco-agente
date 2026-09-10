import React, { useState } from 'react';
import { Copy, Check, Share2, ArrowLeft, Loader2, Users, Link2 } from 'lucide-react';
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
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteUrl = `${window.location.origin}/?room=${roomId}`;
  const shareText = `¡Te desafío a un Truco mano a mano! 🃏🧉 Entrá directo a mi mesa acá: ${inviteUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '¡Te desafío a un Truco Argentino!',
          text: `¡Che! Te armé una mesa mano a mano en Truquero. Entrá directo:`,
          url: inviteUrl
        });
        return;
      } catch (e) {
        // User dismissed or failed; fall through to WhatsApp
      }
    }
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-[100dvh] bg-felt-dark flex flex-col items-center justify-center p-4">
      <div className="bg-wood-border max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/60 text-center text-amber-100 flex flex-col items-center gap-4 sm:gap-5 animate-speech">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase">
          <Users className="w-3.5 h-3.5" /> Mesa Privada Creada
        </div>

        {/* Pulse radar animation */}
        <div className="relative my-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-400/30 absolute inset-0"></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center relative shadow-lg">
            <Loader2 className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 animate-spin" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-300">
            Esperando a tu rival...
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Compartí el enlace directo o el código para que tu rival entre sin escribir nada.
          </p>
        </div>

        {/* Giant Room Code Display */}
        <div className="w-full bg-black/50 border-2 border-amber-500/80 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/80">
            Código de Mesa
          </span>
          <span className="font-mono text-3xl sm:text-5xl font-black tracking-widest text-amber-200">
            {roomId}
          </span>
        </div>

        {/* Viral Action Buttons */}
        <div className="flex flex-col w-full gap-2">
          {/* Main WhatsApp / Native Share Button */}
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg border border-emerald-400/60 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Invitar por WhatsApp o Compartir</span>
          </button>

          {/* Quick Copy Link Button */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 border border-amber-500/50 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="py-2.5 px-3 bg-stone-900/80 hover:bg-stone-800 active:scale-95 text-stone-300 border border-stone-700 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? '¡Código Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
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
