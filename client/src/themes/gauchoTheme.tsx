import { ThemeDefinition } from './types';

export const gauchoTheme: ThemeDefinition = {
  id: 'gaucho',
  name: 'Tradición Gaucha',
  tagline: 'El clásico sabor del campo argentino con facones, mates y cuero.',
  category: 'Clásico',
  author: 'Criollo Oficial',
  badge: '🧉 Oficial',
  colors: {
    tableOuter: 'bg-[#081c15]',
    tableFelt: 'bg-[#0e3b24]',
    cardBg: 'from-stone-50 via-amber-50 to-amber-100/90',
    cardBorder: 'border-stone-400',
    cardText: 'text-stone-900',
    accent: '#d97706'
  },
  cardBack: {
    bgClass: 'from-red-950 via-stone-900 to-amber-950',
    logoText: 'TRUCO',
    pattern: (
      <div className="w-full h-full border border-amber-400/40 rounded flex flex-col items-center justify-center bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:10px_10px] gap-1 p-1">
        <div className="w-10 h-10 rounded-full border-2 border-amber-300 flex items-center justify-center bg-red-950 shadow-inner">
          <span className="text-amber-300 font-serif font-black text-sm tracking-widest">TRUCO</span>
        </div>
      </div>
    )
  },
  suits: {
    espada: {
      name: 'Espada Toledana',
      mini: (
        <svg className="w-3 h-3 text-sky-800" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L14.5 7L13 8L13 18L15 19L15 21L12 20L9 21L9 19L11 18L11 8L9.5 7L12 1Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            <path d="M20 2L24 16L23 54H17L16 16L20 2Z" fill="url(#gSwordBlade)" stroke="#1e3a8a" strokeWidth="1" />
            <line x1="20" y1="12" x2="20" y2="50" stroke="#93c5fd" strokeWidth="1" />
            <path d="M10 54H30C32 54 32 58 30 58H10C8 58 8 54 10 54Z" fill="url(#gGold)" stroke="#78350f" strokeWidth="1" />
            <rect x="18" y="58" width="4" height="14" rx="1" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" />
            <circle cx="20" cy="75" r="4" fill="url(#gGold)" stroke="#78350f" strokeWidth="1" />
            <defs>
              <linearGradient id="gSwordBlade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#bfdbfe" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
              <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    },
    basto: {
      name: 'Basto de Roble',
      mini: (
        <svg className="w-3 h-3 text-emerald-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10 2 9 4 10 7C9 9 7 11 8 14C9 17 10 19 11 22H13C14 19 15 17 16 14C17 11 15 9 14 7C15 4 14 2 12 2Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            <path
              d="M17 76C15 76 14 72 15 65C14 55 12 40 14 25C13 18 16 6 20 4C24 6 27 18 26 25C28 40 26 55 25 65C26 72 25 76 23 76H17Z"
              fill="url(#gWood)"
              stroke="#27272a"
              strokeWidth="1.2"
            />
            <ellipse cx="18" cy="22" rx="3" ry="2" fill="#3f1e0d" />
            <ellipse cx="22" cy="42" rx="3" ry="2.5" fill="#3f1e0d" />
            <rect x="15" y="66" width="10" height="3" rx="1" fill="url(#gGold)" stroke="#78350f" strokeWidth="0.8" />
            <path d="M13 32C10 30 9 26 12 24C14 26 14 30 13 32Z" fill="#15803d" stroke="#052e16" strokeWidth="0.8" />
            <path d="M27 48C30 46 31 42 28 40C26 42 26 46 27 48Z" fill="#15803d" stroke="#052e16" strokeWidth="0.8" />
            <defs>
              <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="40%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    },
    oro: {
      name: 'Sol de Mayo',
      mini: (
        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" fill="#fef08a" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-20 h-20' : size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" fill="url(#gGoldCoin)" stroke="#78350f" strokeWidth="2" />
            <circle cx="30" cy="30" r="21" fill="url(#gGoldCenter)" stroke="#b45309" strokeWidth="1.5" />
            <g stroke="#92400e" strokeWidth="1.5" strokeLinecap="round">
              <line x1="30" y1="12" x2="30" y2="16" />
              <line x1="30" y1="44" x2="30" y2="48" />
              <line x1="12" y1="30" x2="16" y2="30" />
              <line x1="44" y1="30" x2="48" y2="30" />
            </g>
            <circle cx="30" cy="30" r="7" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
            <defs>
              <radialGradient id="gGoldCoin" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
              <radialGradient id="gGoldCenter" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
          </svg>
        );
      }
    },
    copa: {
      name: 'Cáliz de Oro',
      mini: (
        <svg className="w-3 h-3 text-rose-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 3H17V8C17 11 14.5 13.5 12 13.5C9.5 13.5 7 11 7 8V3ZM11 13.5V19H8V21H16V19H13V13.5" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-24' : size === 'lg' ? 'w-12 h-16' : size === 'sm' ? 'w-6 h-8' : 'w-8 h-11';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 50 65" fill="none">
            <path d="M12 6H38C38 6 41 22 36 28C31 34 27 35 25 36C23 35 19 34 14 28C9 22 12 6 12 6Z" fill="url(#gCopa)" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="25" cy="10" rx="11" ry="3" fill="#991b1b" />
            <rect x="23" y="36" width="4" height="15" fill="url(#gGold)" stroke="#78350f" strokeWidth="1" />
            <path d="M15 58C15 54 20 51 25 51C30 51 35 54 35 58H15Z" fill="url(#gGold)" stroke="#78350f" strokeWidth="1.5" />
            <defs>
              <linearGradient id="gCopa" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    }
  },
  figures: {
    10: {
      name: 'Sota Criolla',
      subtitle: 'El Escudero',
      render: () => (
        <svg className="w-12 h-14 sm:w-14 sm:h-16" viewBox="0 0 40 50" fill="currentColor">
          <circle cx="20" cy="10" r="6" fill="#fbcfe8" stroke="#831843" strokeWidth="1" />
          <path d="M14 8C14 4 26 4 26 8L22 4L14 8Z" fill="#b91c1c" />
          <path d="M12 18H28L25 38H15L12 18Z" fill="#1e40af" stroke="#172554" strokeWidth="1" />
          <rect x="15" y="38" width="4" height="10" fill="#78350f" />
          <rect x="21" y="38" width="4" height="10" fill="#78350f" />
        </svg>
      )
    },
    11: {
      name: 'Caballo Domador',
      subtitle: 'El Jinete',
      render: () => (
        <svg className="w-12 h-14 sm:w-14 sm:h-16" viewBox="0 0 50 50" fill="currentColor">
          <path d="M12 40C12 35 15 28 20 25C25 22 30 18 35 12C37 14 38 18 36 22L42 20C40 25 36 28 32 30L35 44H30L27 34L22 38L20 44H14L12 40Z" fill="#713f12" />
          <circle cx="26" cy="14" r="5" fill="#fbcfe8" stroke="#1e3a8a" strokeWidth="1" />
          <path d="M22 11L30 8L26 14Z" fill="#2563eb" />
        </svg>
      )
    },
    12: {
      name: 'Rey Patriota',
      subtitle: 'El Soberano',
      render: () => (
        <svg className="w-12 h-14 sm:w-14 sm:h-16" viewBox="0 0 50 50" fill="currentColor">
          <circle cx="25" cy="13" r="6" fill="#fbcfe8" stroke="#854d0e" strokeWidth="1" />
          <path d="M18 9L21 4L25 8L29 4L32 9H18Z" fill="#eab308" stroke="#713f12" strokeWidth="0.8" />
          <path d="M14 20C14 20 20 18 25 18C30 18 36 20 36 20L34 46H16L14 20Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1" />
        </svg>
      )
    }
  },
  trumpBadges: {
    anchoEspada: 'Macho',
    anchoBasto: 'Hembra',
    sieteEspada: '7 Bravo',
    sieteOro: '7 Bello'
  }
};
