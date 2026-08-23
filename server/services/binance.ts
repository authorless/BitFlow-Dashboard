const BINANCE_API_URL = process.env.BINANCE_API_BASE_URL || 'https://api.binance.com/api/v3'
const REQUEST_TIMEOUT_MS = 10_000
const PRICE_CACHE_TTL_MS = 10_000

let cachedPrice: { value: number, expiresAt: number } | undefined
let pendingPriceRequest: Promise<number> | undefined

export type KlineInterval = '1h' | '4h' | '1d' | '1w'

export interface HistoricalPrice {
  timestamp: number
  price: number
}

const requestBinance = async <T>(path: string, params: Record<string, string | number>): Promise<T> => {
  const url = new URL(`${BINANCE_API_URL.replace(/\/$/, '')}/${path}`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })

  if (!response.ok) {
    throw new Error(`Market data provider returned HTTP ${response.status}`)
  }

  return await response.json() as T
}

export const getBitcoinPrice = async (): Promise<number> => {
  const now = Date.now()

  if (cachedPrice && cachedPrice.expiresAt > now) return cachedPrice.value
  if (pendingPriceRequest) return await pendingPriceRequest

  pendingPriceRequest = (async () => {
    const data = await requestBinance<{ price?: string }>('ticker/price', {
      symbol: 'BTCUSDT'
    })
    const price = Number(data.price)

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Market data provider returned an invalid Bitcoin price')
    }

    cachedPrice = { value: price, expiresAt: Date.now() + PRICE_CACHE_TTL_MS }
    return price
  })()

  try {
    return await pendingPriceRequest
  } finally {
    pendingPriceRequest = undefined
  }
}

export const getHistoricalData = async (
  startTime: number,
  endTime: number,
  interval: KlineInterval
): Promise<HistoricalPrice[]> => {
  const data = await requestBinance<unknown>('klines', {
    symbol: 'BTCUSDT',
    interval,
    startTime,
    endTime,
    limit: 1000
  })

  if (!Array.isArray(data)) {
    throw new Error('Market data provider returned an invalid historical response')
  }

  const prices = data.flatMap((item): HistoricalPrice[] => {
    if (!Array.isArray(item)) return []

    const timestamp = Number(item[0])
    const price = Number(item[4])

    return Number.isSafeInteger(timestamp) &&
      timestamp >= startTime &&
      timestamp <= endTime &&
      Number.isFinite(price) &&
      price > 0
      ? [{ timestamp, price }]
      : []
  })

  if (prices.length === 0) {
    throw new Error('Market data provider returned no historical prices')
  }

  return prices
}
