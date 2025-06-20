// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  
  // Совместимость
  compatibilityDate: '2025-06-20',

  // DevTools
  devtools: { enabled: true },
  
  // Конфигурация сборки
  build: {
    transpile: ['chart.js', 'vue-chartjs']
  },

  // Конфигурация Nitro
  nitro: {
    preset: 'node-server',
    timing: true,
    experimental: {
      wasm: true
    }
  },

  // Vite конфигурация
  vite: {
    optimizeDeps: {
      exclude: ['@prisma/client']
    },
    define: {
      global: 'globalThis'
    }
  },

  // Рантайм конфиг
  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  // Настройки приложения
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Bitcoin Metrics Dashboard',
      meta: [
        { name: 'description', content: 'Real-time Bitcoin price tracking and analytics dashboard' }
      ]
    }
  },

  // Настройки CSS
  css: [],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false // Отключаем typeCheck для development
  },

  // Экспериментальные функции
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  // SSR включен для лучшего SEO
  ssr: true
})
