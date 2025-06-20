import { prisma } from '~/server/db/prisma'

export default defineNuxtPlugin(async () => {
  // Проверяем подключение к базе данных при запуске
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
  
  return {
    provide: {
      prisma
    }
  }
})
