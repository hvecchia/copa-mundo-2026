/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        copa: {
          green:  '#009C3B',
          yellow: '#FFDF00',
          blue:   '#002776',
          gold:   '#C8A951',
          dark:   '#0A0A0A',
          card:   '#141414',
          border: '#2A2A2A',
        },
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
