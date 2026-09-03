import React from 'react';
import { ActionType, GameAction, GameState, PlayerId } from '@truco/core';
import { getAvailableActions } from '@truco/core';
import { soundFx } from '../utils/soundController';
import { Sparkles } from 'lucide-react';

interface ActionBarProps {
  state: GameState;
  player: PlayerId;
  onAction: (action: GameAction) => void;
  disabled?: boolean;
  recommendedAction?: ActionType | null;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  state,
  player,
  onAction,
  disabled = false,
  recommendedAction = null
}) => {
  const availableActions = getAvailableActions(state, player);
  const isMyTurn = state.turn === player && !disabled;

  const handleAction = (type: ActionType) => {
    if (type === 'QUIERO' || type.startsWith('CALL_')) {
      soundFx.playCanto();
    }
    onAction({ type, player });
  };

  if (state.phase === 'hand_ended' || state.phase === 'match_ended') {
    return null;
  }

  // Helper check
  const can = (type: ActionType) => isMyTurn && availableActions.includes(type);

  return (
    <div className="w-full max-w-xl px-1.5 py-1 flex flex-col gap-1.5">
      {/* Response Bar (Quiero / No Quiero) */}
      {(state.phase === 'envido_pending' || state.phase === 'truco_pending' || state.phase === 'flor_pending') && (
        <div className="flex items-center justify-center gap-2 p-1 bg-black/50 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-xl animate-speech">
          {can('QUIERO') && (
            <button
              onClick={() => handleAction('QUIERO')}
              className={`
                flex-1 py-2 sm:py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-emerald-400/50 transition-all flex items-center justify-center gap-1
                ${recommendedAction === 'QUIERO' ? 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse' : ''}
              `}
            >
              {recommendedAction === 'QUIERO' && <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />}
              <span>¡Quiero!</span>
            </button>
          )}

          {can('NO_QUIERO') && (
            <button
              onClick={() => handleAction('NO_QUIERO')}
              className={`
                flex-1 py-2 sm:py-2.5 px-3 bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-rose-400/50 transition-all flex items-center justify-center gap-1
                ${recommendedAction === 'NO_QUIERO' ? 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse' : ''}
              `}
            >
              {recommendedAction === 'NO_QUIERO' && <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />}
              <span>No Quiero</span>
            </button>
          )}
        </div>
      )}

      {/* Main Cantos Grid */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {/* Envido Cantos */}
        {can('CALL_ENVIDO') && (
          <ActionButton
            label="Envido"
            badge="2 pts"
            color="amber"
            onClick={() => handleAction('CALL_ENVIDO')}
            isRecommended={recommendedAction === 'CALL_ENVIDO'}
          />
        )}
        {can('CALL_REAL_ENVIDO') && (
          <ActionButton
            label="Real Envido"
            badge="3 pts"
            color="amber"
            onClick={() => handleAction('CALL_REAL_ENVIDO')}
            isRecommended={recommendedAction === 'CALL_REAL_ENVIDO'}
          />
        )}
        {can('CALL_FALTA_ENVIDO') && (
          <ActionButton
            label="Falta Envido"
            badge="Falta"
            color="amber"
            onClick={() => handleAction('CALL_FALTA_ENVIDO')}
            isRecommended={recommendedAction === 'CALL_FALTA_ENVIDO'}
          />
        )}

        {/* Flor Cantos */}
        {can('CALL_FLOR') && (
          <ActionButton
            label="¡Flor!"
            badge="3 pts"
            color="purple"
            onClick={() => handleAction('CALL_FLOR')}
            isRecommended={recommendedAction === 'CALL_FLOR'}
          />
        )}
        {can('CALL_CONTRAFLOR') && (
          <ActionButton
            label="Contraflor"
            badge="6 pts"
            color="purple"
            onClick={() => handleAction('CALL_CONTRAFLOR')}
            isRecommended={recommendedAction === 'CALL_CONTRAFLOR'}
          />
        )}

        {/* Truco Cantos */}
        {can('CALL_TRUCO') && (
          <ActionButton
            label="¡Truco!"
            badge="2 pts"
            color="blue"
            onClick={() => handleAction('CALL_TRUCO')}
            isRecommended={recommendedAction === 'CALL_TRUCO'}
          />
        )}
        {can('CALL_RETRUCO') && (
          <ActionButton
            label="¡Retruco!"
            badge="3 pts"
            color="blue"
            onClick={() => handleAction('CALL_RETRUCO')}
            isRecommended={recommendedAction === 'CALL_RETRUCO'}
          />
        )}
        {can('CALL_VALE_CUATRO') && (
          <ActionButton
            label="¡Vale Cuatro!"
            badge="4 pts"
            color="red"
            onClick={() => handleAction('CALL_VALE_CUATRO')}
            isRecommended={recommendedAction === 'CALL_VALE_CUATRO'}
          />
        )}

        {/* Fold Button */}
        {can('IRSE_AL_MAZO') && (
          <button
            onClick={() => handleAction('IRSE_AL_MAZO')}
            className="py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg bg-stone-900/80 hover:bg-stone-800 active:scale-95 text-stone-300 font-bold text-[10px] sm:text-xs border border-stone-700 shadow transition-all"
          >
            Me voy al mazo
          </button>
        )}
      </div>
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  badge?: string;
  color: 'amber' | 'blue' | 'purple' | 'red';
  onClick: () => void;
  disabled?: boolean;
  isRecommended?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  badge,
  color,
  onClick,
  disabled = false,
  isRecommended = false
}) => {
  const colorStyles = {
    amber: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-amber-400/60 text-amber-50',
    blue: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 border-sky-400/60 text-sky-50',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border-purple-400/60 text-purple-50',
    red: 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 border-red-400/60 text-red-50'
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-xl font-black text-xs sm:text-sm border shadow-lg transition-all flex items-center gap-1.5 active:scale-95
        ${colorStyles}
        ${isRecommended ? 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,1)] animate-pulse' : ''}
      `}
    >
      {isRecommended && <Sparkles className="w-3 h-3 fill-current text-amber-300" />}
      <span>{label}</span>
      {badge && (
        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-bold border border-white/20">
          {badge}
        </span>
      )}
    </button>
  );
};
