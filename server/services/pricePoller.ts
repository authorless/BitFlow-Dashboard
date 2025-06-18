import { getBitcoinPrice } from './binance';
import { saveBitcoinPrice } from './database';

const POLLING_INTERVAL = 60000; // 1 minute

async function pollBitcoinPrice() {
  try {
    const price = await getBitcoinPrice();
    await saveBitcoinPrice(price);
    console.log(`Bitcoin price saved: $${price}`);
  } catch (error) {
    console.error('Error in price polling:', error);
  }
}

// Start polling
setInterval(pollBitcoinPrice, POLLING_INTERVAL);
console.log('Bitcoin price polling service started');
