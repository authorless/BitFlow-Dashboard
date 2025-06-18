import { getHistoricalData, getBitcoinPrice } from './binance';
import { clearHistoricalPrices } from './database';
import { prisma } from '../lib/prisma';

type IntervalType = 'day' | 'week' | 'month' | 'year';

interface Intervals {
  [key in IntervalType]: string;
}

const INTERVALS: Intervals = {
  day: '1h',      // для дня используем часовые интервалы
  week: '4h',     // для недели 4-часовые
  month: '1d',    // для месяца дневные
  year: '1w',     // для года недельные
};

export const fetchAndSaveHistoricalData = async (startDate: Date, endDate: Date, period: string = 'day') => {
  try {
    // Очищаем старые данные за указанный период
    await clearHistoricalPrices(startDate, endDate);

    const interval = INTERVALS[period] || '1h';
    const historicalData = await getHistoricalData(
      startDate.getTime(),
      endDate.getTime(),
      interval
    );

    // Сохраняем исторические данные в базу с правильными временными метками
    const savePromises = historicalData.map(async (data: { timestamp: number; price: number }) => {
      return await prisma.bitcoinPrice.create({
        data: {
          price: data.price,
          timestamp: new Date(data.timestamp)
        }
      });
    });

    await Promise.all(savePromises);

    // Получаем текущую цену и сохраняем её
    const currentPrice = await getBitcoinPrice();
    await prisma.bitcoinPrice.create({
      data: {
        price: currentPrice,
        timestamp: new Date()
      }
    });

    return historicalData;
  } catch (error) {
    console.error('Error in fetchAndSaveHistoricalData:', error);
    throw error;
  }
};
