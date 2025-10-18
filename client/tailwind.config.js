/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#121822',
        'brand-med': '#1a2333',
        'brand-form': '#1c2638',
        'brand-gold': '#D4AF37', // Aksen emas kita
        'brand-gold-hover': '#E6C24F',
        'brand-blue': '#00BFFF', // Aksen biru crypto
        'brand-text': '#E0E0E0',
        'brand-text-secondary': '#a0a0a0',
        'brand-border': '#333f50',
      }
    },
  },
  plugins: [],
}