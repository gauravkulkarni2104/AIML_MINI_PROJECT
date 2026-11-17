/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dbe5f2',
          200: '#b9cfe4',
          300: '#8bb1d3',
          400: '#5c90c0',
          500: '#3a73ad',
          600: '#2b5b91',
          700: '#234976',
          800: '#1e3e63',
          900: '#0f243d',
          950: '#0a1727'
        }
      }
    },
  },
  plugins: [],
}
