<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <div class="container mx-auto px-4 py-8">      <h1 class="text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
        ₿ BitFlow Dashboard
      </h1>
      
      <div class="mb-8">
        <div class="flex justify-center space-x-4 mb-4 flex-wrap gap-2">
          <button
            v-for="period in periods"
            :key="period.value"
            type="button"
            @click="selectPeriod(period)"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105',
              selectedPeriod.value === period.value
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
            ]"
            :disabled="loading"
            :aria-pressed="selectedPeriod.value === period.value"
          >
            {{ period.label }}
          </button>
        </div>
        
        <div v-if="showCustomPeriod" class="flex justify-center space-x-4 bg-gray-800 p-4 rounded-lg max-w-md mx-auto">
          <input
            type="date"
            v-model="customStartDate"
            aria-label="Start date"
            class="border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            :disabled="loading"
          />
          <input
            type="date"
            v-model="customEndDate"
            aria-label="End date"
            class="border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            :disabled="loading"
          />
          <button
            type="button"
            @click="applyCustomPeriod"
            class="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
            :disabled="loading || !customStartDate || !customEndDate"
          >
            Apply
          </button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        <div class="text-center mb-6">
          <div v-if="error" role="alert" class="text-red-400 mb-4 text-lg">{{ error }}</div>
          <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
            ${{ currentPrice.toLocaleString() }}
          </div>
          <div class="text-gray-400 text-sm mt-2">Current Bitcoin Price</div>
        </div>
        
        <div v-if="loading" role="status" aria-live="polite" class="h-[500px] flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4 animate-pulse">₿</div>
            <div class="text-xl text-gray-400">Loading...</div>
          </div>
        </div>
        
        <div v-else class="h-[500px]">
          <BitcoinChart :prices="prices" :period="selectedPeriod.value" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type PeriodValue = 'day' | 'week' | 'month' | 'year' | 'custom';

interface PricePoint {
  timestamp: string;
  price: number | string;
}

interface Period {
  label: string;
  value: PeriodValue;
}

const currentPrice = ref(0);
const prices = ref<PricePoint[]>([]);
const customStartDate = ref('');
const customEndDate = ref('');
const loading = ref(false);
const priceError = ref('');
const historicalError = ref('');
const error = computed(() => historicalError.value || priceError.value);
let priceRefreshTimer: ReturnType<typeof setInterval> | undefined;

const periods: Period[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const selectedPeriod = ref<Period>(periods[0]!);
const showCustomPeriod = computed(() => selectedPeriod.value.value === 'custom');

const fetchCurrentPrice = async () => {
  try {
    const response = await fetch('/api/price');
    if (!response.ok) throw new Error('Failed to fetch current price');
    const data = await response.json() as { price: number };
    currentPrice.value = data.price;
    priceError.value = '';
  } catch (err) {
    console.error('Error fetching current price:', err);
    priceError.value = 'Failed to fetch current price';
  }
};

const getDateRange = (period: PeriodValue) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  let start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'day':
      break;
    case 'week':
      start = new Date(end);
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start = new Date(end);
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start = new Date(end);
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      break;
  }

  return { start, end };
};

const fetchHistoricalData = async (start: Date, end: Date, period: PeriodValue = 'day') => {
  try {
    loading.value = true;
    historicalError.value = '';
    
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    const params = new URLSearchParams({
      startDate: startTime.toString(),
      endDate: endTime.toString(),
      period
    });

    const response = await fetch(`/api/historical?${params}`);
    if (!response.ok) throw new Error(`Failed to fetch historical data: ${response.status}`);
    
    const data = await response.json() as PricePoint[];
    prices.value = data;
  } catch (err) {
    console.error('Error fetching historical data:', err);
    historicalError.value = 'Failed to fetch historical data';
  } finally {
    loading.value = false;
  }
};

const updateData = async () => {
  const { start, end } = getDateRange(selectedPeriod.value.value);
  await fetchHistoricalData(start, end, selectedPeriod.value.value);
};

const selectPeriod = async (period: Period) => {
  selectedPeriod.value = period;
  if (period.value !== 'custom') {
    await updateData();
  }
};

const applyCustomPeriod = async () => {
  if (!customStartDate.value || !customEndDate.value) {
    historicalError.value = 'Please select both start and end dates';
    return;
  }

  const start = new Date(customStartDate.value);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(customEndDate.value);
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    historicalError.value = 'Start date must be before end date';
    return;
  }

  await fetchHistoricalData(start, end, 'custom');
};

onMounted(async () => {
  await fetchCurrentPrice();

  const { start, end } = getDateRange('day');
  await fetchHistoricalData(start, end, 'day');

  priceRefreshTimer = setInterval(fetchCurrentPrice, 30_000);
});

onUnmounted(() => {
  if (priceRefreshTimer) clearInterval(priceRefreshTimer);
});
</script>
