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
    <div className="bg-gradient-to-b from-[#2a170a] to-[#1a0e05] rounded-xl sm:rounded-2xl p-1.5 sm:p-3 text-amber-100 shadow-xl border border-amber-600/60 sm:border-2 max-w-sm sm:max-w-md w-full select-none relative overflow-hidden">
      {/* Decorative brass corner bolts */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500/80 border border-amber-300 shadow"></div>
      <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500/80 border border-amber-300 shadow"></div>
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500/80 border border-amber-300 shadow"></div>
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500/80 border border-amber-300 shadow"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-700/50 pb-1 mb-1 sm:mb-2 px-1">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 font-headline flex items-center gap-1">
          <span>🪵</span> Anotador ({maxScore} pts)
        </span>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-200">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
          <span>Mano</span>
        </div>
      </div>

      {/* Players columns */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
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
    <div
      className={`p-1 sm:p-2 rounded-lg sm:rounded-xl bg-black/50 border transition-all ${
        isTurn
          ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/40 shadow-md'
          : 'border-amber-950/60'
      }`}
    >
      {/* Player header */}
      <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
        <div className="flex items-center gap-1 overflow-hidden">
          {isMano && (
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 shrink-0 shadow" title="Mano de la ronda"></span>
          )}
          <span className="font-extrabold text-[11px] sm:text-sm truncate text-amber-200">{name}</span>
        </div>
        <span className="text-xs sm:text-base font-black text-amber-400 font-mono shrink-0">
          {points}
        </span>
      </div>

      {/* Fósforos Section */}
      {is30Points ? (
        <div className="space-y-0.5 sm:space-y-1">
          {/* Malas */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] sm:text-[9px] text-amber-400/80 font-bold uppercase tracking-tight">
              M ({malasPoints}/15)
            </span>
            <FosforosRow count={malasPoints} maxBoxes={3} />
          </div>

          {/* Buenas */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] sm:text-[9px] text-amber-300 font-bold uppercase tracking-tight">
              B ({buenasPoints}/15)
            </span>
            <FosforosRow count={buenasPoints} maxBoxes={3} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8px] sm:text-[9px] text-amber-400/80 font-bold uppercase tracking-tight">
            Pts ({points}/15)
          </span>
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
    boxes.push(<RealisticFosforoBox key={i} count={boxCount} />);
  }

  return <div className="flex items-center gap-0.5 sm:gap-1">{boxes}</div>;
};

// Authentic Argentine Matchstick Box with sulfur heads & wood texture
const RealisticFosforoBox: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="w-5 h-5 sm:w-7 sm:h-7 bg-stone-900/90 rounded border border-amber-900/60 relative p-0.5 flex items-center justify-center shadow-inner shrink-0">
      <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 34 34">
        {/* Matchstick 1: Left Vertical */}
        {count >= 1 && (
          <g>
            <line x1="6" y1="7" x2="6" y2="27" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="6" cy="6" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
          </g>
        )}
        {/* Matchstick 2: Top Horizontal */}
        {count >= 2 && (
          <g>
            <line x1="7" y1="6" x2="27" y2="6" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="28" cy="6" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
          </g>
        )}
        {/* Matchstick 3: Right Vertical */}
        {count >= 3 && (
          <g>
            <line x1="28" y1="7" x2="28" y2="27" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="28" cy="28" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
          </g>
        )}
        {/* Matchstick 4: Bottom Horizontal */}
        {count >= 4 && (
          <g>
            <line x1="7" y1="28" x2="27" y2="28" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="6" cy="28" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
          </g>
        )}
        {/* Matchstick 5: Diagonal Slash Cross */}
        {count >= 5 && (
          <g>
            <line x1="7" y1="7" x2="27" y2="27" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="17" cy="17" r="2.2" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
};
