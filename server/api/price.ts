import { getBitcoinPrice } from '~/server/services/binance'
import { enforceRateLimit } from '~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'GET', true)
  enforceRateLimit(event, 'price', 60, 60_000)

  try {
    const price = await getBitcoinPrice()
    setResponseHeader(event, 'Cache-Control', 'public, max-age=10, stale-while-revalidate=20')

    return {
      price,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Unable to fetch the current Bitcoin price:', error instanceof Error ? error.message : error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Market data is temporarily unavailable'
    })
  }
})
