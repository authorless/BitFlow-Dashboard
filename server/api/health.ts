import { prisma } from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'GET', true)
  setResponseHeader(event, 'Cache-Control', 'no-store')

  try {
    await prisma.$queryRaw`SELECT 1`

    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    }
  } catch {
    setResponseStatus(event, 503)

    return {
      status: 'degraded',
      database: 'unavailable',
      timestamp: new Date().toISOString()
    }
  }
})
