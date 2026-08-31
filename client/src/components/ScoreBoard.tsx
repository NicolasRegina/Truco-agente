import React from 'react';
import { PlayerId, ScoreState } from '@truco/core';

interface ScoreBoardProps {
  score: ScoreState;
  maxScore: 15 | 30;
  p1Name: string;
  p2Name: string;
  mano: PlayerId;
  turn: PlayerId;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  maxScore,
  p1Name,
  p2Name,
  mano,
  turn
}) => {
  return (
    <div className="bg-wood-border rounded-xl p-3 sm:p-4 text-amber-100 shadow-xl max-w-sm sm:max-w-md w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-800/80 pb-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
          Anotador ({maxScore} pts)
        </span>
        <div className="flex items-center gap-1.5 text-xs text-amber-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm"></span>
          <span>Mano</span>
        </div>
      </div>

      {/* Players columns */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* P1 */}
        <PlayerScoreColumn
          name={p1Name}
          points={score.p1}
          maxScore={maxScore}
          isMano={mano === 'p1'}
          isTurn={turn === 'p1'}
        />

        {/* P2 */}
        <PlayerScoreColumn
          name={p2Name}
          points={score.p2}
          maxScore={maxScore}
          isMano={mano === 'p2'}
          isTurn={turn === 'p2'}
        />
      </div>
    </div>
  );
};

const PlayerScoreColumn: React.FC<{
  name: string;
  points: number;
  maxScore: 15 | 30;
  isMano: boolean;
  isTurn: boolean;
}> = ({ name, points, maxScore, isMano, isTurn }) => {
  const is30Points = maxScore === 30;
  const malasPoints = is30Points ? Math.min(15, points) : points;
  const buenasPoints = is30Points ? Math.max(0, points - 15) : 0;

  return (
    <div className={`p-2 rounded-lg bg-black/30 border ${isTurn ? 'border-amber-400/80 shadow-md' : 'border-amber-950/40'}`}>
      {/* Player header */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1 overflow-hidden">
          {isMano && (
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Mano de la ronda"></span>
          )}
          <span className="font-bold text-xs sm:text-sm truncate text-amber-200">{name}</span>
        </div>
        <span className="text-sm sm:text-base font-extrabold text-amber-400 shrink-0">
          {points}
        </span>
      </div>

      {/* Fósforos Section */}
      {is30Points ? (
        <div className="space-y-1.5">
          {/* Malas */}
          <div>
            <div className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-0.5">
              Malas ({malasPoints}/15)
            </div>
            <FosforosRow count={malasPoints} maxBoxes={3} />
          </div>

          {/* Buenas */}
          <div>
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mb-0.5">
              Buenas ({buenasPoints}/15)
            </div>
            <FosforosRow count={buenasPoints} maxBoxes={3} />
          </div>
        </div>
      ) : (
        <div>
          <div className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-0.5">
            Puntos ({points}/15)
          </div>
          <FosforosRow count={points} maxBoxes={3} />
        </div>
      )}
    </div>
  );
};

const FosforosRow: React.FC<{ count: number; maxBoxes: number }> = ({ count, maxBoxes }) => {
  const boxes = [];
  for (let i = 0; i < maxBoxes; i++) {
    const boxCount = Math.min(5, Math.max(0, count - i * 5));
    boxes.push(<FosforoBox key={i} count={boxCount} />);
  }

  return <div className="flex items-center gap-1.5">{boxes}</div>;
};

const FosforoBox: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-950/60 rounded border border-amber-900/60 relative p-1 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 32 32">
        {/* Line 1: Left Vertical */}
        {count >= 1 && (
          <line x1="6" y1="6" x2="6" y2="26" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* Line 2: Top Horizontal */}
        {count >= 2 && (
          <line x1="6" y1="6" x2="26" y2="6" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* Line 3: Right Vertical */}
        {count >= 3 && (
          <line x1="26" y1="6" x2="26" y2="26" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* Line 4: Bottom Horizontal */}
        {count >= 4 && (
          <line x1="6" y1="26" x2="26" y2="26" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* Line 5: Diagonal Cross */}
        {count >= 5 && (
          <line x1="6" y1="6" x2="26" y2="26" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
};
