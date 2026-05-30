/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // Dynamic custom color theme matching the user requested color guidelines
        primary: {
          DEFAULT: '#6E9AE0', // Cornflower Blue (Primary CTA, headings, nav)
          50: '#f0f5fc',
          100: '#e1eaf9',
          200: '#c8daf3',
          300: '#a2c2eb',
          400: '#76a5e1',
          500: '#6E9AE0', // Default
          600: '#487bc9',
          700: '#3863a6',
          800: '#325489',
          900: '#2d4771',
          950: '#1d2c47',
        },
        bg: {
          DEFAULT: '#F9FAFD', // Off-White (Overall bright background)
        },
        cardBg: {
          DEFAULT: '#D2DBEA', // Muted Lavender Gray (Survey card boxes, background blocks)
        },
        accent: {
          DEFAULT: '#FBECAC', // Pastel Yellow (Alerts, highlights, stars, warning states)
          50: '#fffef2',
          100: '#fffde3',
          200: '#fffac2',
          300: '#fff394',
          400: '#fdec5c',
          500: '#FBECAC', // Default
          600: '#edd023',
          700: '#c9ab14',
          800: '#a38714',
          900: '#856c15',
        }
      },
    },
  },
  plugins: [],
}
