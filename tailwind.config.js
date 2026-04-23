/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F6EF7',
          light: '#6C8AFF',
          dark: '#3B57D6',
        },
      },
    },
  },
  plugins: [],
}
