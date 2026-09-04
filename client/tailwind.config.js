/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens from DESIGN.md
        primary: '#1b4332',
        'on-primary': '#ffffff',
        secondary: '#5c2c16',
        'on-secondary': '#ffffff',
        tertiary: '#f39c12',
        'on-tertiary': '#081c15',
        surface: '#0e3b24',
        'on-surface': '#ffffff',
        'surface-container': '#160c06',
        neutral: '#0a0503',
        'on-neutral': '#f8fafc',
        'card-bg': '#faf6ee',
        'card-text': '#18181b',
        'accent-sword': '#1d4ed8',
        'accent-basto': '#15803d',
        error: '#dc2626',
        'on-error': '#ffffff',
        // Backward-compatible semantic aliases
        felt: {
          light: '#2d6a4f',
          DEFAULT: '#1b4332',
          dark: '#081c15',
        },
        wood: {
          light: '#8B4513',
          DEFAULT: '#5c2c16',
          dark: '#381608',
        },
        gold: {
          light: '#ffd166',
          DEFAULT: '#f39c12',
          dark: '#d68910',
        }
      },
      fontFamily: {
        headline: ['Cinzel', 'serif'],
        body: ['"Public Sans"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
        label: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 16px -2px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 16px 24px -2px rgba(0, 0, 0, 0.5), 0 6px 12px -2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
