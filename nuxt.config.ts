// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  
  // Конфигурация сборки
  build: {
    transpile: ['chart.js', 'vue-chartjs']
  },

  // Среда выполнения
  nitro: {
    preset: 'node-server'
  },

  // Рантайм конфиг
  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  // Включаем TypeScript
  typescript: {
    strict: true
  }
})
