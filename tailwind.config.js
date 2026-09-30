/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: { soft: '0 18px 50px rgba(15, 23, 42, 0.08)' },
      animation: { pulseRing: 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
      keyframes: { 'pulse-ring': { '0%': { transform: 'scale(.8)', opacity: '.65' }, '75%, 100%': { transform: 'scale(1.25)', opacity: '0' } } }
    }
  },
  plugins: []
}
