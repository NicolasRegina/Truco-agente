import React, { useState } from 'react';
import { MessageSquare, Smile, X } from 'lucide-react';
import { soundFx } from '../utils/soundController';

interface ChatEmotesProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const TRUCO_SAYINGS = [
  '🧉 ¡Unos mates y seguimos!',
  '🃏 ¡Qué mano!',
  '⚡ ¡El envido está primero!',
  '🤔 ¡Mmm, me parece que estás mintiendo!',
  '🔥 ¡A las cartas!',
  '🎯 ¡Lindo tiro!',
  '💪 ¡Esta no me la sacás!',
  '🤫 ¡Picaresca criolla!',
  '👉👈 ¡Que lindo que está el dia!',
  'mira que te como hermano',
  'no te hagas el vivo',
  'no te hagas el boludo',
  'ay que lindo',
  'anda pa alla bobo',
];

export const ChatEmotes: React.FC<ChatEmotesProps> = ({ onSendMessage, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (text: string) => {
    soundFx.playCanto();
    onSendMessage(text);
    setIsOpen(false);
  };

  if (disabled) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 sm:p-2.5 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 shadow-lg active:scale-95 transition-all"
        title="Dichos criollos y frases"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-64 sm:w-72 bg-stone-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl p-3 z-50 animate-speech">
          <div className="flex items-center justify-between border-b border-stone-700 pb-1.5 mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Dichos Criollos
            </span>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {TRUCO_SAYINGS.map((saying, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(saying)}
                className="text-left text-xs py-1.5 px-2 rounded-lg bg-stone-800/80 hover:bg-amber-900/40 hover:text-amber-200 text-stone-200 transition-colors"
              >
                {saying}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
