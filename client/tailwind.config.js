/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a2332',
        'brand-med': '#1f2937',
        'brand-form': '#2a3a4a',
        'brand-text': '#e0e0e0',
        'brand-text-secondary': '#9ca3af',
        'brand-gold': '#d4af37',
        'brand-gold-hover': '#b8941f',
        'brand-blue': '#00d4ff',
        'brand-border': '#4b5563',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-gold-strong': '0 0 40px rgba(212, 175, 55, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
      },
      backdropBlur: {
        'sm': '4px',
      },
    },
  },
  plugins: [],
}