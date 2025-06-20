import { prisma } from '~/server/db/prisma'

export const saveBitcoinPrice = async (price: number, timestamp: Date) => {
  try {
    // Сначала попытаемся найти запись с таким timestamp
    const existing = await prisma.bitcoinPrice.findFirst({
      where: {
        timestamp: timestamp
      }
    })

    if (existing) {
      // Обновляем существующую запись
      const result = await prisma.bitcoinPrice.update({
        where: {
          id: existing.id
        },
        data: {
          price: price
        }
      })
      return result
    } else {
      // Создаем новую запись
      const result = await prisma.bitcoinPrice.create({
        data: {
          price: price,
          timestamp: timestamp
        }
      })
      return result
    }
  } catch (error) {
    console.error('Error saving Bitcoin price:', error)
    throw error
  }
}

export const clearHistoricalPrices = async (startDate: Date, endDate: Date) => {
  try {
    await prisma.bitcoinPrice.deleteMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  } catch (error) {
    console.error('Error clearing historical prices:', error)
    throw error
  }
}

export const getHistoricalPrices = async (startDate: Date, endDate: Date) => {
  try {
    const result = await prisma.bitcoinPrice.findMany({
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
    return result
  } catch (error) {
    console.error('Error fetching historical prices:', error)
    throw error
  }
}
