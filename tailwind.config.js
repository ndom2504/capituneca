/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cm-white': '#FFFFFF',
        'cm-black': '#1A1A1A',
        'cm-navy': '#26374A',
        'cm-blue-nav': '#284162',
        'cm-blue-hover': '#0535D2',
        'cm-error': '#D3080C',
        'cm-grey-fine': '#64748b',
        'cm-gold': '#C5A059',
        'cm-purple': '#7C3AED',
        'cm-purple-light': '#F5F3FF',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px -5px rgba(124, 58, 237, 0.3)',
        'glow-gold': '0 0 20px -5px rgba(197, 160, 89, 0.3)',
      },
    },
  },
  plugins: [],
};
