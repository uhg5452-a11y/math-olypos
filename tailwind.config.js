/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olympiad: {
          darkest: '#0B192C',
          dark: '#1E3E62',
          primary: '#008DDA',
          light: '#41B06E',
          accent: '#FFB800',
          card: 'rgba(30, 62, 98, 0.75)',
          border: 'rgba(0, 141, 218, 0.3)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 8px rgba(0, 141, 218, 0.4))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 16px rgba(0, 141, 218, 0.8))' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
