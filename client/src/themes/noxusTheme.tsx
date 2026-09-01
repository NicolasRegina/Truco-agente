import { ThemeDefinition } from './types';

export const noxusTheme: ThemeDefinition = {
  id: 'noxus',
  name: 'Imperio Noxus',
  tagline: 'Fuerza, hierro negro y sangre carmesí inspirados en Runaterra.',
  category: 'Colaboración',
  author: 'Gaming Collab',
  badge: '⚔️ Noxus',
  colors: {
    tableOuter: 'bg-[#180508]',
    tableFelt: 'bg-[#450a0a]',
    cardBg: 'from-stone-950 via-red-950 to-stone-900',
    cardBorder: 'border-red-600',
    cardText: 'text-red-100 font-serif',
    accent: '#dc2626'
  },
  cardBack: {
    bgClass: 'from-black via-red-950 to-stone-950',
    logoText: 'NOXUS',
    pattern: (
      <div className="w-full h-full border-2 border-red-600/70 rounded flex flex-col items-center justify-center bg-[radial-gradient(#dc2626_1.5px,transparent_1.5px)] [background-size:10px_10px] gap-1 p-1">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center bg-black shadow-inner">
          <span className="text-red-500 font-serif font-black text-[10px] tracking-widest">NOXUS</span>
        </div>
      </div>
    )
  },
  suits: {
    espada: {
      name: 'Hacha de Guerra',
      mini: (
        <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L18 8L16 10L14 8L14 20H10V8L8 10L6 8L12 2Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            {/* Noxian Double-Bladed Axe */}
            <path d="M20 10L6 18C4 28 8 40 20 44L20 74H22L22 44C34 40 38 28 36 18L22 10V4H20V10Z" fill="url(#noxBlade)" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="21" cy="27" r="4" fill="#dc2626" />
            <defs>
              <linearGradient id="noxBlade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="50%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    },
    basto: {
      name: 'Mazo de Hierro',
      mini: (
        <svg className="w-3 h-3 text-stone-400" viewBox="0 0 24 24" fill="currentColor">
          <rect x="7" y="2" width="10" height="8" rx="2" />
          <rect x="11" y="10" width="2" height="12" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            {/* Heavy Iron Hammer */}
            <rect x="6" y="8" width="28" height="18" rx="3" fill="#27272a" stroke="#dc2626" strokeWidth="1.5" />
            <line x1="6" y1="17" x2="34" y2="17" stroke="#dc2626" strokeWidth="1" />
            <rect x="18" y="26" width="4" height="48" fill="#18181b" stroke="#71717a" strokeWidth="1" />
          </svg>
        );
      }
    },
    oro: {
      name: 'Moneda de Piltóver',
      mini: (
        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-18' : size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 60 60" fill="none">
            <polygon points="30,4 54,18 54,42 30,56 6,42 6,18" fill="#1c1917" stroke="#dc2626" strokeWidth="2" />
            <polygon points="30,12 46,22 46,38 30,48 14,38 14,22" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="30" cy="30" r="6" fill="#f59e0b" />
          </svg>
        );
      }
    },
    copa: {
      name: 'Cáliz de Sangre',
      mini: (
        <svg className="w-3 h-3 text-red-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 3H18V10C18 13 15 15 12 15C9 15 6 13 6 10V3ZM11 15V20H8V22H16V20H13V15" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-24' : size === 'lg' ? 'w-12 h-16' : size === 'sm' ? 'w-6 h-8' : 'w-8 h-11';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 50 65" fill="none">
            <path d="M10 6H40C40 6 42 22 36 30C30 36 26 37 25 38C24 37 20 36 14 30C8 22 10 6 10 6Z" fill="#18181b" stroke="#dc2626" strokeWidth="2" />
            <ellipse cx="25" cy="12" rx="12" ry="4" fill="#991b1b" />
            <rect x="23" y="38" width="4" height="15" fill="#27272a" stroke="#dc2626" strokeWidth="1" />
            <path d="M14 58C14 53 20 50 25 50C30 50 36 53 36 58H14Z" fill="#18181b" stroke="#dc2626" strokeWidth="1.5" />
          </svg>
        );
      }
    }
  },
  figures: {
    10: {
      name: 'Katarina',
      subtitle: 'La Cuchilla',
      render: () => (
        <div className="w-12 h-14 bg-stone-900 border-2 border-red-600 rounded flex flex-col items-center justify-center">
          <span className="text-base text-red-500">🗡️</span>
          <span className="text-[7px] font-bold text-red-300">KATARINA</span>
        </div>
      )
    },
    11: {
      name: 'Darius',
      subtitle: 'La Mano de Noxus',
      render: () => (
        <div className="w-12 h-14 bg-stone-900 border-2 border-red-600 rounded flex flex-col items-center justify-center">
          <span className="text-base text-red-500">🪓</span>
          <span className="text-[7px] font-bold text-red-300">DARIUS</span>
        </div>
      )
    },
    12: {
      name: 'Swain',
      subtitle: 'Gran General',
      render: () => (
        <div className="w-12 h-14 bg-stone-900 border-2 border-red-600 rounded flex flex-col items-center justify-center">
          <span className="text-base text-red-500">🦅</span>
          <span className="text-[7px] font-bold text-red-300">SWAIN</span>
        </div>
      )
    }
  },
  trumpBadges: {
    anchoEspada: 'Ejecución',
    anchoBasto: 'Hemorragia',
    sieteEspada: 'Cuchilla',
    sieteOro: 'Tributo'
  }
};
