/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resort: {
          cream: '#FAF7F2',
          creamDark: '#F2ECE1',
          beige: '#EFE8DC',
          beigeDark: '#E2D7C3',
          olive: '#263628',
          oliveLight: '#3A4E3D',
          oliveDeep: '#182319',
          brown: '#5A422D',
          brownDark: '#433020',
          gold: '#C5A059',
          goldLight: '#DFC385',
          goldDark: '#A68138',
          charcoal: '#1A1D1A'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(24, 35, 25, 0.12)',
        'luxury-lg': '0 25px 50px -12px rgba(24, 35, 25, 0.22)',
        'gold-glow': '0 0 25px rgba(197, 160, 89, 0.35)'
      }
    },
  },
  plugins: [],
}
