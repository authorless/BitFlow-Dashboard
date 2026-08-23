// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  
  // Совместимость
  compatibilityDate: '2025-06-20',

  // DevTools are never included in the production build.
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  
  // Конфигурация сборки
  build: {
    transpile: ['chart.js', 'vue-chartjs']
  },

  // Конфигурация Nitro
  nitro: {
    preset: 'node-server'
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

  // Browser hardening for production responses.
  routeRules: process.env.NODE_ENV === 'production'
    ? {
        '/**': {
          headers: {
            'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'same-origin',
            'Permissions-Policy': 'accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-Permitted-Cross-Domain-Policies': 'none'
          }
        }
      }
    : {},

  // Настройки приложения
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Bitcoin Metrics Dashboard',
      meta: [
        { name: 'description', content: 'Real-time Bitcoin price tracking and analytics dashboard' }
      ]
    }
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false // Отключаем typeCheck для development
  },

  // SSR включен для лучшего SEO
  ssr: true
})
