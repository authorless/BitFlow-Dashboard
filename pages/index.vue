<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-center">Bitcoin Price Tracker</h1>
    
    <div class="mb-8">
      <div class="flex justify-center space-x-4 mb-4">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectPeriod(period)"
          :class="[
            'px-4 py-2 rounded-lg',
            selectedPeriod.value === period.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          ]"
          :disabled="loading"
        >
          {{ period.label }}
        </button>
      </div>
      
      <div v-if="showCustomPeriod" class="flex justify-center space-x-4">
        <input
          type="date"
          v-model="customStartDate"
          class="border rounded px-3 py-2"
          :disabled="loading"
        />
        <input
          type="date"
          v-model="customEndDate"
          class="border rounded px-3 py-2"
          :disabled="loading"
        />
        <button
          @click="applyCustomPeriod"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg"
          :disabled="loading"
        >
          Apply
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="text-center mb-4">
        <div v-if="error" class="text-red-600 mb-2">{{ error }}</div>
        <span class="text-2xl font-bold">Current Price: ${{ currentPrice.toLocaleString() }}</span>
      </div>
      
      <div v-if="loading" class="h-[500px] flex items-center justify-center">
        <div class="text-xl text-gray-600">Loading...</div>
      </div>
      
      <div v-else class="h-[500px]">
        <BitcoinChart :prices="prices" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentPrice = ref(0);
const prices = ref<Array<{ timestamp: string; price: number }>>([]);
const customStartDate = ref('');
const customEndDate = ref('');
const loading = ref(false);
const error = ref<string>('');

const periods = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const selectedPeriod = ref(periods[0]);
const showCustomPeriod = computed(() => selectedPeriod.value.value === 'custom');

const fetchCurrentPrice = async () => {
  try {
    console.log('Fetching current price...');
    const response = await fetch('/api/price');
    if (!response.ok) throw new Error('Failed to fetch current price');
    const data = await response.json();
    console.log('Received price data:', data);
    currentPrice.value = data.price;
  } catch (err) {
    console.error('Error fetching current price:', err);
    error.value = 'Failed to fetch current price';
  }
};

const getDateRange = (period: string) => {
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

const fetchHistoricalData = async (start: Date, end: Date, period: string = 'day') => {
  try {
    loading.value = true;
    error.value = '';
    
    // Проверяем, что даты корректны
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    console.log('Fetching historical data with params:', { startTime, endTime, period });
    
    const params = new URLSearchParams({
      startDate: startTime.toString(),
      endDate: endTime.toString(),
      period
    });

    const url = `/api/historical?${params}`;
    console.log('Historical data URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch historical data: ${response.status}`);
    
    const data = await response.json();
    console.log('Received historical data:', data.length, 'items');
    prices.value = data;
  } catch (err) {
    console.error('Error fetching historical data:', err);
    error.value = 'Failed to fetch historical data';
    prices.value = [];
  } finally {
    loading.value = false;
  }
};

const updateData = async () => {
  try {
    const { start, end } = getDateRange(selectedPeriod.value.value);
    await fetchCurrentPrice();
    await fetchHistoricalData(start, end, selectedPeriod.value.value);
  } catch (err) {
    console.error('Error updating data:', err);
    error.value = 'Failed to update data';
  }
};

const selectPeriod = async (period: typeof periods[0]) => {
  selectedPeriod.value = period;
  if (period.value !== 'custom') {
    await updateData();
  }
};

const applyCustomPeriod = async () => {
  if (!customStartDate.value || !customEndDate.value) {
    error.value = 'Please select both start and end dates';
    return;
  }

  const start = new Date(customStartDate.value);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(customEndDate.value);
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    error.value = 'Start date must be before end date';
    return;
  }

  await fetchHistoricalData(start, end);
};

// Начальная загрузка данных
onMounted(async () => {
  console.log('Component mounted, initializing data...');
  
  // Устанавливаем текущую цену сразу при загрузке
  await fetchCurrentPrice();
  
  // Затем получаем исторические данные за день
  const { start, end } = getDateRange('day');
  await fetchHistoricalData(start, end, 'day');
  
  console.log('Initial data loaded');
  
  // Запускаем обновление цены каждые 30 секунд
  const interval = setInterval(fetchCurrentPrice, 30000);
  onUnmounted(() => clearInterval(interval));
});
</script>
