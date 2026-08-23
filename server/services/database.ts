import { prisma } from '~/server/db/prisma'
import type { HistoricalPrice } from './binance'

export const replaceHistoricalPrices = async (
  startDate: Date,
  endDate: Date,
  prices: HistoricalPrice[]
) => {
  await prisma.$transaction([
    prisma.bitcoinPrice.deleteMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    prisma.bitcoinPrice.createMany({
      data: prices.map(({ price, timestamp }) => ({
        price,
        timestamp: new Date(timestamp)
      })),
      skipDuplicates: true
    })
  ])
}

export const getHistoricalPrices = async (startDate: Date, endDate: Date) => {
  return await prisma.bitcoinPrice.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      timestamp: 'asc'
    },
    select: {
      price: true,
      timestamp: true
    }
  })
}
