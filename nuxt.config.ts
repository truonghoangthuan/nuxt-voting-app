export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@vueuse/motion/nuxt'],
  runtimeConfig: {
    firebase: {
      projectId: '',
      clientEmail: '',
      privateKey: '',
    },
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
});
