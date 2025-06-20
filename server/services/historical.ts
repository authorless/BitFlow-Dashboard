import { getHistoricalData, getBitcoinPrice } from './binance';
import { clearHistoricalPrices, saveBitcoinPrice } from './database';

export type IntervalType = 'day' | 'week' | 'month' | 'year';

type Intervals = Record<IntervalType, string>;

const INTERVALS: Intervals = {
  day: '1h',      // для дня используем часовые интервалы
  week: '4h',     // для недели 4-часовые
  month: '1d',    // для месяца дневные
  year: '1w',     // для года недельные
};

export const fetchAndSaveHistoricalData = async (startDate: Date, endDate: Date, period: IntervalType = 'day') => {
  try {
    // Очищаем старые данные за указанный период
    await clearHistoricalPrices(startDate, endDate);

    const interval = INTERVALS[period];
    const historicalData = await getHistoricalData(
      startDate.getTime(),
      endDate.getTime(),
      interval
    );

    // Сохраняем исторические данные в базу с правильными временными метками
    const savePromises = historicalData.map(async (data: { timestamp: number; price: number }) => {
      return await saveBitcoinPrice(data.price, new Date(data.timestamp));
    });

    await Promise.all(savePromises);

    // Получаем текущую цену и сохраняем её
    const currentPrice = await getBitcoinPrice();
    await saveBitcoinPrice(currentPrice, new Date());

    return historicalData;
  } catch (error) {
    console.error('Error in fetchAndSaveHistoricalData:', error);
    throw error;
  }
};
