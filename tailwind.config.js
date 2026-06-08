/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#4fc3f7',
          400: '#4fc3f7',
          500: '#29b6f6',
          600: '#03a9f4',
        },
        bg: {
          root: '#0a1628',
          panel: '#111d32',
          header: '#0d1a2d',
          card: '#0a1628',
        },
      },
    },
  },
  plugins: [],
}
