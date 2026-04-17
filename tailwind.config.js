/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Kimmel brand yellow — change this hex to match exact brand color ──
        kimmel: {
          yellow:      '#FFCC00',
          'yellow-dk': '#E6B800',
          'yellow-bg': 'rgba(255,204,0,0.10)',
          'yellow-ring':'rgba(255,204,0,0.30)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.4)',
        'card-lg':  '0 4px 16px rgba(0,0,0,0.5)',
        modal:      '0 24px 64px rgba(0,0,0,0.75)',
        drawer:     '-8px 0 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
