import { ThemeDefinition } from './types';
import { Suit } from '@truco/core';

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
    cardBg: 'from-[#faf6ee] via-[#f7f2e7] to-[#f2ecdd]',
    cardBorder: 'border-stone-400',
    cardText: 'text-stone-900',
    accent: '#d97706'
  },
  cardBack: {
    bgClass: 'from-amber-950 via-stone-900 to-red-950',
    logoText: 'TRUCO',
    pattern: (
      <div className="w-full h-full relative overflow-hidden rounded">
        <img
          src="/themes/gaucho/card_back.jpg"
          alt="Dorso Truco"
          className="w-full h-full object-cover rounded shadow-inner"
        />
      </div>
    )
  },
  suits: {
    espada: {
      name: 'Espada Toledana',
      mini: (
        <svg className="w-3.5 h-3.5 text-sky-800" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L14.5 7L13 8L13 18L15 19L15 21L12 20L9 21L9 19L11 18L11 8L9.5 7L12 1Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            <path d="M20 2L24 16L23 54H17L16 16L20 2Z" fill="url(#gSwordBlade)" stroke="#1e3a8a" strokeWidth="1.2" />
            <line x1="20" y1="12" x2="20" y2="50" stroke="#93c5fd" strokeWidth="1.2" />
            <path d="M10 54H30C32 54 32 58 30 58H10C8 58 8 54 10 54Z" fill="url(#gGold)" stroke="#78350f" strokeWidth="1" />
            <rect x="18" y="58" width="4" height="14" rx="1" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" />
            <circle cx="20" cy="75" r="4" fill="url(#gGold)" stroke="#78350f" strokeWidth="1" />
            <defs>
              <linearGradient id="gSwordBlade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
          </svg>
        );
      }
    },
    basto: {
      name: 'Basto de Roble',
      mini: (
        <svg className="w-3.5 h-3.5 text-amber-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 2C8 4 9 7 10 10L9 18L10 22H14L15 18L14 10C15 7 16 4 14 2H10Z" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 40 80" fill="none">
            <path d="M14 6C11 12 13 22 15 32L14 68C14 74 26 74 26 68L25 32C27 22 29 12 26 6C23 3 17 3 14 6Z" fill="url(#gWood)" stroke="#451a03" strokeWidth="1.5" />
            <circle cx="12" cy="18" r="3.5" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
            <circle cx="28" cy="28" r="3.5" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
            <circle cx="12" cy="42" r="3" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
            <defs>
              <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="40%" stopColor="#b45309" />
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
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-20 h-20' : size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" fill="url(#gGoldCoin)" stroke="#78350f" strokeWidth="2" />
            <circle cx="30" cy="30" r="21" fill="url(#gGoldCenter)" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="30" cy="30" r="8" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
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
        <svg className="w-3.5 h-3.5 text-rose-700" viewBox="0 0 24 24" fill="currentColor">
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
      name: 'Sota',
      subtitle: 'Diez',
      render: (suit?: Suit) => {
        const suitName = suit === 'espada' ? 'Espadas' : suit === 'basto' ? 'Bastos' : suit === 'oro' ? 'Oros' : 'Copas';
        const suitBadgeColor = suit === 'espada' ? 'bg-sky-800' : suit === 'basto' ? 'bg-amber-900' : suit === 'oro' ? 'bg-amber-600' : 'bg-rose-700';

        return (
          <div className="flex flex-col items-center justify-center p-1 bg-amber-50/80 rounded-lg border border-amber-900/30 shadow-inner w-full max-w-[80px]">
            <div className="w-10 h-10 rounded-full border border-amber-600 bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center shadow">
              <span className="text-xl">🧑‍🌾</span>
            </div>
            <span className={`text-[8px] font-black text-white px-1.5 py-0.2 rounded-full mt-1 ${suitBadgeColor} tracking-tighter uppercase`}>
              Sota de {suitName}
            </span>
          </div>
        );
      }
    },
    11: {
      name: 'Caballo',
      subtitle: 'Once',
      render: (suit?: Suit) => {
        const suitName = suit === 'espada' ? 'Espadas' : suit === 'basto' ? 'Bastos' : suit === 'oro' ? 'Oros' : 'Copas';
        const suitBadgeColor = suit === 'espada' ? 'bg-sky-800' : suit === 'basto' ? 'bg-amber-900' : suit === 'oro' ? 'bg-amber-600' : 'bg-rose-700';

        return (
          <div className="flex flex-col items-center justify-center p-1 bg-amber-50/80 rounded-lg border border-amber-900/30 shadow-inner w-full max-w-[80px]">
            <div className="w-10 h-10 rounded-full border border-amber-600 bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center shadow">
              <span className="text-xl">🐎</span>
            </div>
            <span className={`text-[8px] font-black text-white px-1.5 py-0.2 rounded-full mt-1 ${suitBadgeColor} tracking-tighter uppercase`}>
              Caballo {suitName}
            </span>
          </div>
        );
      }
    },
    12: {
      name: 'Rey',
      subtitle: 'Doce',
      render: (suit?: Suit) => {
        const suitName = suit === 'espada' ? 'Espadas' : suit === 'basto' ? 'Bastos' : suit === 'oro' ? 'Oros' : 'Copas';
        const suitBadgeColor = suit === 'espada' ? 'bg-sky-800' : suit === 'basto' ? 'bg-amber-900' : suit === 'oro' ? 'bg-amber-600' : 'bg-rose-700';

        return (
          <div className="flex flex-col items-center justify-center p-1 bg-amber-50/80 rounded-lg border border-amber-900/30 shadow-inner w-full max-w-[80px]">
            <div className="w-10 h-10 rounded-full border border-amber-600 bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center shadow">
              <span className="text-xl">👑</span>
            </div>
            <span className={`text-[8px] font-black text-white px-1.5 py-0.2 rounded-full mt-1 ${suitBadgeColor} tracking-tighter uppercase`}>
              Rey de {suitName}
            </span>
          </div>
        );
      }
    }
  },
  trumpBadges: {
    anchoEspada: 'Macho',
    anchoBasto: 'Hembra',
    sieteEspada: '7 Bravo',
    sieteOro: '7 Bello'
  }
};
