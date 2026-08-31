import React from 'react';
import { ActionType, GameAction, GameState, PlayerId } from '@truco/core';
import { getAvailableActions } from '@truco/core';
import { soundFx } from '../utils/soundController';

interface ActionBarProps {
  state: GameState;
  player: PlayerId;
  onAction: (action: GameAction) => void;
  disabled?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  state,
  player,
  onAction,
  disabled = false
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
    <div className="w-full max-w-2xl px-2 py-2 flex flex-col gap-2">
      {/* Response Bar (Quiero / No Quiero / Raises) */}
      {(state.phase === 'envido_pending' || state.phase === 'truco_pending' || state.phase === 'flor_pending') && (
        <div className="flex items-center justify-center gap-2 p-1.5 bg-black/50 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-xl animate-speech">
          {can('QUIERO') && (
            <button
              onClick={() => handleAction('QUIERO')}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg border border-emerald-400/50 transition-all"
            >
              ¡Quiero!
            </button>
          )}

          {can('NO_QUIERO') && (
            <button
              onClick={() => handleAction('NO_QUIERO')}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg border border-rose-400/50 transition-all"
            >
              No Quiero
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
          />
        )}
        {can('CALL_REAL_ENVIDO') && (
          <ActionButton
            label="Real Envido"
            badge="3 pts"
            color="amber"
            onClick={() => handleAction('CALL_REAL_ENVIDO')}
          />
        )}
        {can('CALL_FALTA_ENVIDO') && (
          <ActionButton
            label="Falta Envido"
            badge="Falta"
            color="amber"
            onClick={() => handleAction('CALL_FALTA_ENVIDO')}
          />
        )}

        {/* Flor Cantos */}
        {can('CALL_FLOR') && (
          <ActionButton
            label="¡Flor!"
            badge="3 pts"
            color="purple"
            onClick={() => handleAction('CALL_FLOR')}
          />
        )}
        {can('CALL_CONTRAFLOR') && (
          <ActionButton
            label="Contraflor"
            badge="6 pts"
            color="purple"
            onClick={() => handleAction('CALL_CONTRAFLOR')}
          />
        )}
        {can('CALL_CONTRAFLOR_AL_RESTO') && (
          <ActionButton
            label="Contraflor al Resto"
            color="purple"
            onClick={() => handleAction('CALL_CONTRAFLOR_AL_RESTO')}
          />
        )}

        {/* Truco Cantos */}
        {can('CALL_TRUCO') && (
          <ActionButton
            label="¡Truco!"
            badge="2 pts"
            color="blue"
            onClick={() => handleAction('CALL_TRUCO')}
          />
        )}
        {can('CALL_RETRUCO') && (
          <ActionButton
            label="¡Quiero Re-Truco!"
            badge="3 pts"
            color="blue"
            onClick={() => handleAction('CALL_RETRUCO')}
          />
        )}
        {can('CALL_VALE_CUATRO') && (
          <ActionButton
            label="¡Quiero Vale Cuatro!"
            badge="4 pts"
            color="indigo"
            onClick={() => handleAction('CALL_VALE_CUATRO')}
          />
        )}

        {/* Mazo */}
        {can('IRSE_AL_MAZO') && (
          <button
            onClick={() => handleAction('IRSE_AL_MAZO')}
            className="py-1.5 sm:py-2 px-3 bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-300 font-bold text-xs rounded-lg border border-stone-600 transition-all ml-auto"
          >
            Me voy al mazo
          </button>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{
  label: string;
  badge?: string;
  color: 'amber' | 'blue' | 'indigo' | 'purple';
  onClick: () => void;
}> = ({ label, badge, color, onClick }) => {
  const colorMap = {
    amber: 'from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-amber-400/40 text-amber-50',
    blue: 'from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 border-sky-400/40 text-sky-50',
    indigo: 'from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 border-indigo-400/40 text-indigo-50',
    purple: 'from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 border-purple-400/40 text-purple-50'
  }[color];

  return (
    <button
      onClick={onClick}
      className={`
        py-2 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm
        bg-gradient-to-b ${colorMap}
        border shadow-md active:scale-95 transition-transform flex items-center gap-1.5
      `}
    >
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-bold">
          {badge}
        </span>
      )}
    </button>
  );
};
