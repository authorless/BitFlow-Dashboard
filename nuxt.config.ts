// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  
  // Конфигурация сборки
  build: {
    transpile: ['chart.js', 'vue-chartjs']
  },

  // Среда выполнения
  nitro: {
    preset: 'node-server',
    timing: true
  },

  // Рантайм конфиг
  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  // Production настройки
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Bitcoin Price Tracker',
      meta: [
        { name: 'description', content: 'Track Bitcoin price changes in real-time' }
      ]
    }
  },

  // Оптимизация производительности
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  // Включаем TypeScript
  typescript: {
    strict: true
  }
})
