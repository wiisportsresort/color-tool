/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.tsx', './pages/**/*.tsx', './styles/**/*.scss'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
