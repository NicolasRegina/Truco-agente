import { ThemeDefinition } from './types';

export const pixelTheme: ThemeDefinition = {
  id: 'pixel',
  name: 'Pixel Arcade 8-Bit',
  tagline: 'Estilo retro arcade nostálgico con píxeles y colores de 8 bits.',
  category: 'Retro Gaming',
  author: 'Arcade Studio',
  badge: '👾 8-Bit',
  colors: {
    tableOuter: 'bg-[#0f172a]',
    tableFelt: 'bg-[#1e1b4b]',
    cardBg: 'from-stone-900 via-indigo-950 to-slate-900',
    cardBorder: 'border-cyan-400',
    cardText: 'text-cyan-300 font-mono',
    accent: '#22d3ee'
  },
  cardBack: {
    bgClass: 'from-purple-900 via-indigo-950 to-cyan-950',
    logoText: 'PIXEL',
    pattern: (
      <div className="w-full h-full border-2 border-cyan-400/80 rounded flex flex-col items-center justify-center bg-[radial-gradient(#06b6d4_2px,transparent_2px)] [background-size:8px_8px] gap-1 p-1">
        <div className="w-10 h-10 border-2 border-fuchsia-400 flex items-center justify-center bg-black">
          <span className="text-cyan-300 font-mono font-black text-xs">8BIT</span>
        </div>
      </div>
    )
  },
  suits: {
    espada: {
      name: 'Pixel Blade',
      mini: (
        <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 16 16" fill="currentColor">
          <rect x="7" y="1" width="2" height="9" />
          <rect x="4" y="10" width="8" height="2" />
          <rect x="7" y="12" width="2" height="3" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 16 24" fill="currentColor">
            <rect x="7" y="1" width="2" height="13" fill="#22d3ee" />
            <rect x="6" y="3" width="4" height="9" fill="#67e8f9" />
            <rect x="7" y="2" width="2" height="2" fill="#ffffff" />
            <rect x="3" y="14" width="10" height="2" fill="#eab308" />
            <rect x="7" y="16" width="2" height="5" fill="#78350f" />
            <rect x="6" y="21" width="4" height="2" fill="#eab308" />
          </svg>
        );
      }
    },
    basto: {
      name: 'Pixel Club',
      mini: (
        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
          <rect x="6" y="2" width="4" height="12" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-16 h-28' : size === 'lg' ? 'w-10 h-16' : size === 'sm' ? 'w-5 h-8' : 'w-7 h-12';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 16 24" fill="currentColor">
            <rect x="5" y="2" width="6" height="5" fill="#854d0e" />
            <rect x="6" y="7" width="4" height="12" fill="#a16207" />
            <rect x="4" y="5" width="2" height="2" fill="#22c55e" />
            <rect x="10" y="8" width="2" height="2" fill="#22c55e" />
            <rect x="5" y="19" width="6" height="3" fill="#eab308" />
          </svg>
        );
      }
    },
    oro: {
      name: 'Pixel Coin',
      mini: (
        <svg className="w-3 h-3 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
          <rect x="4" y="2" width="8" height="12" rx="1" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-18' : size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 16 16" fill="currentColor">
            <rect x="4" y="1" width="8" height="14" fill="#eab308" />
            <rect x="2" y="3" width="12" height="10" fill="#eab308" />
            <rect x="4" y="3" width="8" height="10" fill="#facc15" />
            <rect x="6" y="5" width="4" height="6" fill="#fef08a" />
            <rect x="7" y="6" width="2" height="4" fill="#a16207" />
          </svg>
        );
      }
    },
    copa: {
      name: 'Pixel Potion',
      mini: (
        <svg className="w-3 h-3 text-rose-500" viewBox="0 0 16 16" fill="currentColor">
          <rect x="6" y="2" width="4" height="3" />
          <rect x="4" y="5" width="8" height="9" />
        </svg>
      ),
      render: (size) => {
        const dim = size === 'giant' ? 'w-18 h-24' : size === 'lg' ? 'w-12 h-16' : size === 'sm' ? 'w-6 h-8' : 'w-8 h-11';
        return (
          <svg className={`${dim} drop-shadow-sm`} viewBox="0 0 16 20" fill="currentColor">
            <rect x="6" y="1" width="4" height="3" fill="#eab308" />
            <rect x="5" y="4" width="6" height="2" fill="#cbd5e1" />
            <rect x="3" y="6" width="10" height="10" fill="#cbd5e1" />
            <rect x="4" y="7" width="8" height="8" fill="#f43f5e" />
            <rect x="5" y="8" width="3" height="3" fill="#fda4af" />
            <rect x="4" y="16" width="8" height="3" fill="#eab308" />
          </svg>
        );
      }
    }
  },
  figures: {
    10: {
      name: 'Pixel Rogue',
      subtitle: 'Nivel 10',
      render: () => (
        <div className="w-12 h-14 bg-black border-2 border-cyan-400 flex flex-col items-center justify-center font-mono">
          <span className="text-base text-cyan-400">🧙‍♂️</span>
          <span className="text-[7px] text-cyan-300">ROGUE</span>
        </div>
      )
    },
    11: {
      name: 'Pixel Knight',
      subtitle: 'Nivel 11',
      render: () => (
        <div className="w-12 h-14 bg-black border-2 border-emerald-400 flex flex-col items-center justify-center font-mono">
          <span className="text-base text-emerald-400">🏇</span>
          <span className="text-[7px] text-emerald-300">KNIGHT</span>
        </div>
      )
    },
    12: {
      name: 'Pixel Boss',
      subtitle: 'Nivel Final',
      render: () => (
        <div className="w-12 h-14 bg-black border-2 border-amber-400 flex flex-col items-center justify-center font-mono">
          <span className="text-base text-amber-400">👑</span>
          <span className="text-[7px] text-amber-300">BOSS</span>
        </div>
      )
    }
  },
  trumpBadges: {
    anchoEspada: 'Legendario',
    anchoBasto: 'Mítico',
    sieteEspada: 'Épico',
    sieteOro: 'Raro'
  }
};
