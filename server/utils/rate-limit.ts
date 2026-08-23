import type { H3Event } from 'h3'
import { createError, getRequestIP, setResponseHeader } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const globalRateLimit = globalThis as typeof globalThis & {
  bitflowRateLimits?: Map<string, RateLimitEntry>
}
const rateLimits = globalRateLimit.bitflowRateLimits ?? new Map<string, RateLimitEntry>()
const MAX_RATE_LIMIT_ENTRIES = 10_000

globalRateLimit.bitflowRateLimits = rateLimits

const getClientAddress = (event: H3Event) => {
  const trustProxy = process.env.TRUST_PROXY === 'true'
  return getRequestIP(event, { xForwardedFor: trustProxy }) || 'unknown'
}

export const enforceRateLimit = (
  event: H3Event,
  scope: string,
  limit: number,
  windowMs: number
) => {
  const now = Date.now()
  const key = `${scope}:${getClientAddress(event)}`
  const current = rateLimits.get(key)

  if (!current || current.resetAt <= now) {
    if (!current && rateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
      for (const [entryKey, entry] of rateLimits) {
        if (entry.resetAt <= now) rateLimits.delete(entryKey)
      }

      while (rateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
        const oldestKey = rateLimits.keys().next().value
        if (oldestKey === undefined) break
        rateLimits.delete(oldestKey)
      }
    }

    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
  } else {
    current.count += 1

    if (current.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
      setResponseHeader(event, 'Retry-After', retryAfter)
      throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    }
  }
}
