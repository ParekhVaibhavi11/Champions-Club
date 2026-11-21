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
          red: '#C8102E',      // Brand Red CTA / Accent
          dark: '#111111',     // Obsidian Dark
          surface: '#1A1A1A',  // Slightly elevated dark surface
          grey: '#F3F4F6',     // Light grey background
          card: '#FFFFFF',     // White card surfaces
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Teko"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
