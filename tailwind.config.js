/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        void: {
          900: '#05060a',
          800: '#0a0d18',
          700: '#111626',
          600: '#1a2138',
          500: '#243056',
        },
        arcana: {
          50: '#eef2ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99,102,241,0.5)',
        glowLg: '0 0 60px -10px rgba(99,102,241,0.6)',
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}