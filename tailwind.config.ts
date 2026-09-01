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
        claude: {
          bg: '#F8F7F4',
          card: '#FFFFFF',
          text: '#1D1C1B',
          muted: '#6B6861',
          border: '#E8E5E1',
          hover: '#F2EFEA',
          accent: '#D97757',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
