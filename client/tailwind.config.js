/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      boxShadow: {
        'card': '0 8px 16px -2px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 16px 24px -2px rgba(0, 0, 0, 0.5), 0 6px 12px -2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
