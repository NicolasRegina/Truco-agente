import React from 'react';

// ==========================================
// 1. MATE ITEM PREVIEWS (SVG High Fidelity)
// ==========================================
export const MatePreview: React.FC<{ mateId: string; className?: string }> = ({ mateId, className = 'w-16 h-20' }) => {
  switch (mateId) {
    case 'mate_algarrobo':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 60 70" className="w-full h-full drop-shadow-md" fill="none">
            {/* Bombilla alpaca con anillo dorado */}
            <line x1="40" y1="8" x2="26" y2="40" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <line x1="41" y1="10" x2="27" y2="40" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            <circle cx="42" cy="7" r="3" fill="#eab308" stroke="#854d0e" strokeWidth="1" />
            
            {/* Cuerpo de madera noble torneada */}
            <defs>
              <linearGradient id="algarroboGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="40%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="brassVirola" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <ellipse cx="30" cy="45" rx="20" ry="20" fill="url(#algarroboGrad)" stroke="#451a03" strokeWidth="2" />
            
            {/* Vetas de madera talladas */}
            <path d="M16 42 Q 22 55 30 57" stroke="#78350f" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M22 34 Q 32 46 40 44" stroke="#78350f" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M36 36 Q 44 48 38 58" stroke="#78350f" strokeWidth="1.2" fill="none" opacity="0.6" />

            {/* Base torneada */}
            <ellipse cx="30" cy="62" rx="11" ry="3.5" fill="#451a03" />

            {/* Boca y Yerba */}
            <ellipse cx="30" cy="26" rx="15" ry="6" fill="#14532d" stroke="#451a03" strokeWidth="1.5" />
            <ellipse cx="30" cy="26" rx="10" ry="3.5" fill="#166534" />
            
            {/* Virola de bronce / oro pulido */}
            <ellipse cx="30" cy="24" rx="16" ry="5.5" fill="url(#brassVirola)" stroke="#854d0e" strokeWidth="1" />
          </svg>
        </div>
      );

    case 'mate_camionero':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 60 70" className="w-full h-full drop-shadow-md" fill="none">
            {/* Bombilla curva ancha */}
            <line x1="42" y1="6" x2="28" y2="40" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="43" y1="8" x2="29" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeLinecap="round" />
            <circle cx="44" cy="5" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

            {/* Cuerpo de cuero vacuno rústico */}
            <defs>
              <linearGradient id="cueroGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#573318" />
                <stop offset="60%" stopColor="#3d1e0d" />
                <stop offset="100%" stopColor="#1f0e05" />
              </linearGradient>
            </defs>
            <path
              d="M10 32 C 10 56, 18 64, 30 64 C 42 64, 50 56, 50 32 Z"
              fill="url(#cueroGrad)"
              stroke="#1a0c04"
              strokeWidth="2"
            />
            {/* 4 patas de cuero reforzadas */}
            <rect x="16" y="60" width="6" height="5" rx="2" fill="#1f0e05" />
            <rect x="38" y="60" width="6" height="5" rx="2" fill="#1f0e05" />

            {/* Costuras a mano de tiento (stitches) */}
            <line x1="20" y1="36" x2="24" y2="38" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="43" x2="23" y2="45" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="50" x2="24" y2="52" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />

            <line x1="36" y1="38" x2="40" y2="36" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="37" y1="45" x2="41" y2="43" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="36" y1="52" x2="40" y2="50" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />

            {/* Virola ancha de acero */}
            <ellipse cx="30" cy="27" rx="18" ry="6.5" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
            <ellipse cx="30" cy="28" rx="14" ry="4.5" fill="#14532d" />
            <circle cx="34" cy="27" r="2" fill="#166534" />
          </svg>
        </div>
      );

    case 'mate_imperial':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 60 70" className="w-full h-full drop-shadow-md" fill="none">
            {/* Bombilla cincelada con pico dorado */}
            <line x1="43" y1="6" x2="28" y2="38" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="8" x2="29" y2="38" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            <circle cx="45" cy="5" r="3.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />

            {/* Cuerpo de calabaza forrada en cuero negro azabache */}
            <defs>
              <linearGradient id="blackLeather" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="60%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
              <linearGradient id="alpacaGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            <ellipse cx="30" cy="45" rx="19" ry="19" fill="url(#blackLeather)" stroke="#09090b" strokeWidth="2" />
            <ellipse cx="30" cy="62" rx="12" ry="4" fill="#09090b" />

            {/* Gran Virola de Alpaca Cincelada con relieve criollo */}
            <path
              d="M12 28 C 12 18, 48 18, 48 28 L 46 33 C 46 25, 14 25, 14 33 Z"
              fill="url(#alpacaGrad)"
              stroke="#475569"
              strokeWidth="1.2"
            />
            {/* Grabados / cincelados en la virola */}
            <circle cx="18" cy="27" r="1.2" fill="#475569" />
            <circle cx="23" cy="26" r="1.2" fill="#475569" />
            <circle cx="30" cy="25.5" r="1.5" fill="#b45309" />
            <circle cx="37" cy="26" r="1.2" fill="#475569" />
            <circle cx="42" cy="27" r="1.2" fill="#475569" />

            {/* Yerba copete */}
            <ellipse cx="30" cy="28" rx="13" ry="4.5" fill="#14532d" />
            <ellipse cx="30" cy="28" rx="9" ry="2.5" fill="#15803d" />
          </svg>
        </div>
      );

    case 'mate_stanley':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 60 70" className="w-full h-full drop-shadow-md" fill="none">
            {/* Bombilla recta moderna */}
            <line x1="38" y1="6" x2="26" y2="40" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="39" y1="8" x2="27" y2="40" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" />
            <rect x="37" y="4" width="4" height="4" rx="1" fill="#64748b" />

            {/* Vaso térmico con doble pared de acero inoxidable verde oliva */}
            <defs>
              <linearGradient id="stanleyGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#365314" />
                <stop offset="35%" stopColor="#4d7c0f" />
                <stop offset="70%" stopColor="#365314" />
                <stop offset="100%" stopColor="#1a2e05" />
              </linearGradient>
            </defs>
            {/* Cuerpo recto cónico */}
            <path
              d="M15 28 L 18 59 C 18 62, 42 62, 42 59 L 45 28 Z"
              fill="url(#stanleyGreen)"
              stroke="#1a2e05"
              strokeWidth="2"
            />
            {/* Logotipo grabado láser */}
            <path d="M28 44 L 32 44 L 30 40 Z" fill="#a3e635" opacity="0.6" />

            {/* Borde metálico satinado superior */}
            <ellipse cx="30" cy="28" rx="15" ry="4.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            <ellipse cx="30" cy="28" rx="11" ry="3" fill="#14532d" />
          </svg>
        </div>
      );

    default: // mate_calabaza
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 60 70" className="w-full h-full drop-shadow-md" fill="none">
            {/* Bombilla tradicional */}
            <line x1="40" y1="8" x2="24" y2="38" stroke="#cbd5e1" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="41" cy="7" r="2.5" fill="#d97706" />

            {/* Porongo natural */}
            <defs>
              <linearGradient id="calabazaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="70%" stopColor="#713f12" />
                <stop offset="100%" stopColor="#3b1d07" />
              </linearGradient>
            </defs>
            <ellipse cx="30" cy="45" rx="18" ry="18" fill="url(#calabazaGrad)" stroke="#271306" strokeWidth="1.8" />
            <ellipse cx="30" cy="27" rx="13" ry="5" fill="#14532d" stroke="#271306" strokeWidth="1.5" />
            
            {/* Virola de aluminio */}
            <ellipse cx="30" cy="25" rx="14" ry="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
          </svg>
        </div>
      );
  }
};

// ==========================================
// 2. CARD BACK PREVIEWS (Real High-Res Playing Card Back Image)
// ==========================================
export const CardBackPreview: React.FC<{ cardId: string; className?: string }> = ({ cardId, className = 'w-14 h-20' }) => {
  const imgMap: Record<string, string> = {
    card_clasico: '/card_backs/card_clasico.jpg',
    card_pampa: '/card_backs/card_pampa.jpg',
    card_sol: '/card_backs/card_sol.jpg',
    card_gold: '/card_backs/card_gold.jpg',
    card_rojo: '/card_backs/card_rojo.jpg',
  };

  const src = imgMap[cardId] || '/card_backs/card_clasico.jpg';

  return (
    <div className={`relative rounded-xl border-2 border-amber-500/70 shadow-xl overflow-hidden bg-stone-900 flex items-center justify-center select-none ${className}`}>
      <img
        src={src}
        alt="Dorso de carta"
        className="w-full h-full object-cover card-img-crisp pointer-events-none select-none transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/themes/gaucho/card_back.jpg';
        }}
      />
    </div>
  );
};

// ==========================================
// 3. BORDER PREVIEWS (Avatar Frame Display)
// ==========================================
export const BorderPreview: React.FC<{ borderId: string; className?: string }> = ({ borderId, className = 'w-16 h-16' }) => {
  switch (borderId) {
    case 'border_silver':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-slate-300 ring-2 ring-slate-400/80 shadow-[0_0_20px_rgba(203,213,225,0.6)] flex items-center justify-center text-2xl relative">
            <span className="absolute -top-1 -right-1 text-[9px]">✨</span>
            🧉
          </div>
        </div>
      );

    case 'border_gold':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-stone-900 to-amber-950 border-2 border-amber-300 ring-4 ring-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center justify-center text-2xl relative">
            <span className="absolute -top-1.5 -right-1.5 text-xs">☀️</span>
            🧉
          </div>
        </div>
      );

    case 'border_fire':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-red-950 to-orange-950 border-2 border-orange-500 ring-4 ring-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.9)] flex items-center justify-center text-2xl relative animate-pulse">
            <span className="absolute -top-2 -right-1 text-sm">🔥</span>
            🧉
          </div>
        </div>
      );

    default: // border_default
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-full h-full rounded-2xl bg-amber-950/70 border-2 border-amber-700/80 shadow-inner flex items-center justify-center text-2xl">
            🧉
          </div>
        </div>
      );
  }
};

// ==========================================
// 4. TITLE PREVIEWS (Parchment Ribbon)
// ==========================================
export const TitlePreview: React.FC<{ titleName: string; className?: string }> = ({ titleName, className = 'w-full' }) => {
  return (
    <div className={`relative flex items-center justify-center py-1 select-none ${className}`}>
      <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2">
        <span className="text-amber-400 text-sm">📜</span>
        <span className="text-xs font-headline font-bold text-amber-200 tracking-wide">
          "{titleName}"
        </span>
      </div>
    </div>
  );
};
