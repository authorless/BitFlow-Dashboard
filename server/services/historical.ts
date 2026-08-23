import { getHistoricalData } from './binance'
import type { KlineInterval } from './binance'
import { replaceHistoricalPrices } from './database'

export type IntervalType = 'day' | 'week' | 'month' | 'year' | 'custom'

const INTERVALS: Record<Exclude<IntervalType, 'custom'>, KlineInterval> = {
  day: '1h',
  week: '4h',
  month: '1d',
  year: '1w'
}

const INTERVAL_DURATION_MS: Record<KlineInterval, number> = {
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000
}

const MAX_KLINES = 1000

const getCustomInterval = (startDate: Date, endDate: Date): KlineInterval => {
  const durationHours = (endDate.getTime() - startDate.getTime()) / 3_600_000

  if (durationHours <= 48) return '1h'
  if (durationHours <= 24 * 14) return '4h'
  return '1d'
}

const getSafeInterval = (
  startDate: Date,
  endDate: Date,
  period: IntervalType
): KlineInterval => {
  const requestedInterval = period === 'custom'
    ? getCustomInterval(startDate, endDate)
    : INTERVALS[period]
  const durationMs = endDate.getTime() - startDate.getTime()

  if (durationMs / INTERVAL_DURATION_MS[requestedInterval] <= MAX_KLINES) {
    return requestedInterval
  }

  return (['4h', '1d', '1w'] as const).find(
    interval => durationMs / INTERVAL_DURATION_MS[interval] <= MAX_KLINES
  ) ?? '1w'
}

export const fetchAndSaveHistoricalData = async (
  startDate: Date,
  endDate: Date,
  period: IntervalType = 'day'
) => {
  const interval = getSafeInterval(startDate, endDate, period)
  const historicalData = await getHistoricalData(
    startDate.getTime(),
    endDate.getTime(),
    interval
  )

  await replaceHistoricalPrices(startDate, endDate, historicalData)

  return historicalData
}
