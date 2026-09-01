import { ThemeDefinition } from './types';

export const scalonetaTheme: ThemeDefinition = {
  id: 'scaloneta',
  name: 'Scaloneta ⭐⭐⭐',
  tagline: 'Mazo oficial de la Selección Campeona del Mundo en Qatar.',
  category: 'Edición Especial',
  author: 'AFA Campeón',
  badge: '⭐⭐⭐ Campeón',
  colors: {
    tableOuter: 'bg-[#031526]',
    tableFelt: 'bg-[#0284c7]',
    cardBg: 'from-sky-50 via-white to-sky-100',
    cardBorder: 'border-sky-400',
    cardText: 'text-sky-950',
    accent: '#38bdf8'
  },
  cardBack: {
    bgClass: 'from-sky-700 via-sky-800 to-sky-950',
    logoText: '⭐⭐⭐',
    pattern: (
      <div className="w-full h-full border border-sky-300/50 rounded flex flex-col items-center justify-center bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:10px_10px] gap-1 p-1">
        <div className="w-12 h-12 rounded-full border-2 border-amber-300 flex flex-col items-center justify-center bg-sky-950 shadow-inner">
          <span className="text-amber-300 font-black text-[10px] tracking-widest">ARG</span>
          <span className="text-amber-400 text-[8px] font-extrabold">⭐⭐⭐</span>
        </div>
      </div>
    )
  },
  suits: {
    espada: {
      name: 'Laurel de Campeón',
      mini: (
        <svg className="w-3 h-3 text-sky-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 8L13 9L13 18L15 19L15 21L12 20L9 21L9 19L11 18L11 9L9 8L12 2Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            {/* Sword with Golden Laurels */}
            <path d="M20 4L23 20L22 55H18L17 20L20 4Z" fill="url(#scBlade)" stroke="#0284c7" strokeWidth="1" />
            <line x1="20" y1="14" x2="20" y2="52" stroke="#38bdf8" strokeWidth="1" />
            {/* Golden Laurels around blade */}
            <path d="M14 26C10 24 10 20 14 18C16 20 16 24 14 26Z" fill="#eab308" />
            <path d="M26 26C30 24 30 20 26 18C24 20 24 24 26 26Z" fill="#eab308" />
            <path d="M13 38C9 36 9 32 13 30C15 32 15 36 13 38Z" fill="#eab308" />
            <path d="M27 38C31 36 31 32 27 30C25 32 25 36 27 38Z" fill="#eab308" />
            {/* Guard */}
            <rect x="10" y="55" width="20" height="4" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            <rect x="18" y="59" width="4" height="13" fill="#0284c7" />
            <circle cx="20" cy="75" r="4" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            <defs>
              <linearGradient id="scBlade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    },
    basto: {
      name: 'Botín de Oro',
      mini: (
        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 18H20L18 12L12 10L6 14L4 18Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-20' : size === 'lg' ? 'w-12 h-14' : size === 'sm' ? 'w-6 h-7' : 'w-9 h-10';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 60 40" fill="none">
            {/* Golden Football Boot */}
            <path d="M6 28C6 24 10 18 16 16L32 14L48 20L54 28H6Z" fill="url(#bootGrad)" stroke="#78350f" strokeWidth="1.5" />
            <path d="M22 16L20 24M28 15L26 24M34 16L32 24" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            {/* Studs (Tapones dorados) */}
            <rect x="10" y="28" width="5" height="4" fill="#f59e0b" />
            <rect x="22" y="28" width="5" height="4" fill="#f59e0b" />
            <rect x="36" y="28" width="5" height="4" fill="#f59e0b" />
            <rect x="46" y="28" width="5" height="4" fill="#f59e0b" />
            <defs>
              <linearGradient id="bootGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    },
    oro: {
      name: 'Balón 3 Estrellas',
      mini: (
        <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-20 h-20' : size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="26" fill="url(#ballGrad)" stroke="#b45309" strokeWidth="1.5" />
            {/* Pentagon Soccer pattern */}
            <polygon points="30,16 38,22 35,32 25,32 22,22" fill="#78350f" stroke="#fef08a" strokeWidth="1" />
            <line x1="30" y1="16" x2="30" y2="6" stroke="#78350f" strokeWidth="1.5" />
            <line x1="38" y1="22" x2="48" y2="18" stroke="#78350f" strokeWidth="1.5" />
            <line x1="35" y1="32" x2="44" y2="42" stroke="#78350f" strokeWidth="1.5" />
            <line x1="25" y1="32" x2="16" y2="42" stroke="#78350f" strokeWidth="1.5" />
            <line x1="22" y1="22" x2="12" y2="18" stroke="#78350f" strokeWidth="1.5" />
            {/* 3 Golden Stars */}
            <text x="30" y="52" fontSize="10" fontWeight="900" fill="#78350f" textAnchor="middle">⭐⭐⭐</text>
            <defs>
              <radialGradient id="ballGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </radialGradient>
            </defs>
          </svg>
        );
      }
    },
    copa: {
      name: 'Copa del Mundo',
      mini: (
        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4H19V8C19 12 15 15 12 15C9 15 5 12 5 8V4ZM10 15V19H7V21H17V19H14V15" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-26' : size === 'lg' ? 'w-12 h-18' : size === 'sm' ? 'w-6 h-9' : 'w-8 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 50 70" fill="none">
            {/* World Cup Trophy Globe */}
            <circle cx="25" cy="16" r="12" fill="url(#trophyGrad)" stroke="#78350f" strokeWidth="1" />
            <path d="M19 14C23 10 27 10 31 14" stroke="#a16207" strokeWidth="1" />
            {/* Athletes Body holding globe */}
            <path d="M17 26C15 36 17 48 20 54H30C33 48 35 36 33 26L25 32L17 26Z" fill="url(#trophyGrad)" stroke="#78350f" strokeWidth="1" />
            {/* Malachite Green Base bands */}
            <rect x="16" y="54" width="18" height="5" rx="1" fill="#15803d" stroke="#052e16" strokeWidth="0.8" />
            <rect x="14" y="60" width="22" height="6" rx="1" fill="url(#trophyGrad)" stroke="#78350f" strokeWidth="1" />
            <defs>
              <linearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    }
  },
  figures: {
    10: {
      name: 'La 10 del Capitán',
      subtitle: 'El Genio',
      render: () => (
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-14 bg-gradient-to-b from-sky-400 to-sky-600 rounded-lg p-1 text-center border-2 border-white shadow flex flex-col items-center justify-center">
            <span className="text-[16px] font-black text-white leading-none">10</span>
            <span className="text-[7px] font-black text-amber-300 uppercase tracking-tighter">CAPITÁN</span>
          </div>
        </div>
      )
    },
    11: {
      name: 'El Dibu',
      subtitle: 'El Muro',
      render: () => (
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-14 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-lg p-1 text-center border-2 border-amber-300 shadow flex flex-col items-center justify-center">
            <span className="text-sm font-black text-white leading-none">🧤</span>
            <span className="text-[7px] font-black text-white uppercase tracking-tighter mt-1">ATAJADA</span>
          </div>
        </div>
      )
    },
    12: {
      name: 'El Rey de Qatar',
      subtitle: 'Eterno',
      render: () => (
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-14 bg-gradient-to-b from-amber-400 to-amber-600 rounded-lg p-1 text-center border-2 border-white shadow flex flex-col items-center justify-center">
            <span className="text-sm font-black text-stone-900 leading-none">🏆</span>
            <span className="text-[7px] font-black text-stone-950 uppercase tracking-tighter mt-1">CAMPEÓN</span>
          </div>
        </div>
      )
    }
  },
  trumpBadges: {
    anchoEspada: 'La Gloria',
    anchoBasto: 'El Aguante',
    sieteEspada: '7 de Qatar',
    sieteOro: 'Balón de Oro'
  }
};
