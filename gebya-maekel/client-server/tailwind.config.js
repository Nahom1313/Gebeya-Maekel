/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#111827',
          card: '#1f2937',
          text: '#f9fafb',
        }
      }
    },
  },
  plugins: [],
}