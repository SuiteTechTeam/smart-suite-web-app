/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#437F54',
          white: '#E1E8EC',
        },
        secondary: {
          brown: '#9D7850',
          green1: '#4A845B',
          green2: '#5B7051',
          beige: '#E7CAA9',
        },
        gray: {
          1: '#D9D9D9',
          2: '#8E8E8E',
        },
        black: '#282828',
        white: '#FFFFFF',
        text: {
          green: '#437F54',
          black: '#282828',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
} 