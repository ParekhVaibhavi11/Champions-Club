/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        champion: {
          dark: '#111111',
          red: '#C8102E',
          'red-hover': '#A50D25',
          grey: '#F3F4F6',
          surface: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
