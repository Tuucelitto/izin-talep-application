// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-18',

  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
    tailwindcss: {
    // opsiyonel ayarlar, ör: jit, viewer, css path
    viewer: true
  },

  css: [
    'primevue/resources/themes/saga-blue/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
    '~/assets/main.css'
  ],

  build: {
    transpile: ['primevue']
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  runtimeConfig: {
    public: {
      appName: 'İzin Talep Sistemi'
    }
  },

  // PrimeVue auto-import
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  // Vite yapılandırması
  vite: {
    optimizeDeps: {
      include: ['primevue']
    }
  },

  // PrimeVue bileşenlerini otomatik import et
  imports: {
    dirs: ['~/composables/**']
  }
})
