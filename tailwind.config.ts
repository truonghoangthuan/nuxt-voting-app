import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FDFD96', // Yellow pastel background
          main: '#A3E635', // Lime green
          accent: '#0EA5E9', // Sky blue
          danger: '#F87171', // Red
          text: '#171717', // Neutral 900
          white: '#FFFFFF',
          black: '#000000',
        },
      },
      boxShadow: {
        neo: '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
