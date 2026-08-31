import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Abandonar',
  cancelLabel = 'Continuar Jugando',
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-speech">
      <div className="bg-wood-border max-w-sm w-full rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-rose-500/60 text-center text-amber-100">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-rose-300 mb-1">{title}</h3>
        <p className="text-xs sm:text-sm text-stone-300 mb-5">{message}</p>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 font-bold text-xs sm:text-sm rounded-xl border border-stone-600 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg border border-rose-400 transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
