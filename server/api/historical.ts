import { getHistoricalPrices } from '~/server/services/database'
import { fetchAndSaveHistoricalData } from '~/server/services/historical'
import type { IntervalType } from '~/server/services/historical'
import { enforceRateLimit } from '~/server/utils/rate-limit'

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000
const ALLOWED_PERIODS = new Set<IntervalType>(['day', 'week', 'month', 'year', 'custom'])

const parseTimestamp = (value: unknown, name: string): number => {
  const timestamp = typeof value === 'string' ? Number(value) : Number.NaN

  if (!Number.isFinite(timestamp)) {
    throw createError({ statusCode: 400, statusMessage: `${name} must be a valid timestamp` })
  }

  return timestamp
}

export default defineEventHandler(async (event) => {
  assertMethod(event, 'GET')
  enforceRateLimit(event, 'historical', 12, 60_000)

  const query = getQuery(event)
  const startTimestamp = parseTimestamp(query.startDate, 'startDate')
  const requestedEndTimestamp = parseTimestamp(query.endDate, 'endDate')
  const endTimestamp = Math.min(requestedEndTimestamp, Date.now())

  if (startTimestamp >= endTimestamp) {
    throw createError({ statusCode: 400, statusMessage: 'startDate must be earlier than endDate' })
  }

  if (endTimestamp - startTimestamp > MAX_RANGE_MS) {
    throw createError({ statusCode: 400, statusMessage: 'The maximum date range is 366 days' })
  }

  let period: IntervalType = 'day'

  if (query.period !== undefined) {
    if (typeof query.period !== 'string' || !ALLOWED_PERIODS.has(query.period as IntervalType)) {
      throw createError({ statusCode: 400, statusMessage: 'period is invalid' })
    }

    period = query.period as IntervalType
  }
  const startDate = new Date(startTimestamp)
  const endDate = new Date(endTimestamp)

  try {
    await fetchAndSaveHistoricalData(startDate, endDate, period)
  } catch (error) {
    console.warn('Unable to refresh historical Bitcoin prices:', error instanceof Error ? error.message : error)

    try {
      const cachedPrices = await getHistoricalPrices(startDate, endDate)

      if (cachedPrices.length > 0) {
        setResponseHeader(event, 'Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
        setResponseHeader(event, 'Warning', '110 - "Response is stale"')
        setResponseHeader(event, 'X-Data-Source', 'database-cache')
        return cachedPrices
      }
    } catch (databaseError) {
      console.error('Unable to read cached historical Bitcoin prices:', databaseError instanceof Error ? databaseError.message : databaseError)
      throw createError({
        statusCode: 503,
        statusMessage: 'Historical data storage is temporarily unavailable'
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Historical market data is temporarily unavailable'
    })
  }

  try {
    const prices = await getHistoricalPrices(startDate, endDate)

    setResponseHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
    setResponseHeader(event, 'X-Data-Source', 'market-provider')
    return prices
  } catch (error) {
    console.error('Unable to read historical Bitcoin prices:', error instanceof Error ? error.message : error)
    throw createError({
      statusCode: 503,
      statusMessage: 'Historical data storage is temporarily unavailable'
    })
  }
})
