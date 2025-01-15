/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'steelblue',
        'primary-hover': '#2b5174',
      }
    },
  },
  plugins: [],
} 