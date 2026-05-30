/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e1e7fe',
          200: '#c8d3fd',
          300: '#a2b4fa',
          400: '#768df7',
          500: '#4f66f1',
          600: '#3846e4',
          700: '#2b34cb',
          800: '#262ca5',
          900: '#242a83',
          950: '#15174f',
        },
      },
    },
  },
  plugins: [],
}
