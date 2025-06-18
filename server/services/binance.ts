import axios from 'axios';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export const getBitcoinPrice = async () => {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/price?symbol=BTCUSDT`);
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    throw error;
  }
};

export const getHistoricalData = async (startTime: number, endTime: number, interval: string) => {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/klines`, {
      params: {
        symbol: 'BTCUSDT',
        interval: interval,
        startTime: startTime,
        endTime: endTime,
        limit: 1000
      }
    });
    return response.data.map((item: any[]) => ({
      timestamp: item[0],
      price: parseFloat(item[4]) // Closing price
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};
