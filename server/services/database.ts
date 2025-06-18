import { prisma } from '../lib/prisma';

export const saveBitcoinPrice = async (price: number) => {
  try {
    return await prisma.bitcoinPrice.create({
      data: {
        price: price
      }
    });
  } catch (error) {
    console.error('Error saving Bitcoin price:', error);
    throw error;
  }
};

export const clearHistoricalPrices = async (startDate: Date, endDate: Date) => {
  try {
    await prisma.bitcoinPrice.deleteMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  } catch (error) {
    console.error('Error clearing historical prices:', error);
    throw error;
  }
};

export const getHistoricalPrices = async (startDate: Date, endDate: Date) => {
  try {
    return await prisma.bitcoinPrice.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    throw error;
  }
};
