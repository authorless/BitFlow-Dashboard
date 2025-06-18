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
        >
          {{ period.label }}
        </button>
      </div>
      
      <div v-if="showCustomPeriod" class="flex justify-center space-x-4">
        <input
          type="date"
          v-model="customStartDate"
          class="border rounded px-3 py-2"
        />
        <input
          type="date"
          v-model="customEndDate"
          class="border rounded px-3 py-2"
        />
        <button
          @click="applyCustomPeriod"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Apply
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="text-center mb-4">
        <span class="text-2xl font-bold">Current Price: ${{ currentPrice }}</span>
      </div>
      
      <div class="h-[500px]">
        <BitcoinChart :prices="prices" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentPrice = ref(0);
const prices = ref([]);
const customStartDate = ref('');
const customEndDate = ref('');

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
    const response = await fetch('/api/price');
    const data = await response.json();
    currentPrice.value = data.price;
  } catch (error) {
    console.error('Error fetching current price:', error);
  }
};

const getDateRange = (period: string) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999); // Конец дня
  
  let start = new Date();
  start.setHours(0, 0, 0, 0); // Начало дня

  switch (period) {
    case 'day':
      // Оставляем текущий день
      break;
    case 'week':
      start = new Date(end);
      start.setDate(end.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(end);
      start.setMonth(end.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start = new Date(end);
      start.setFullYear(end.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

const fetchHistoricalData = async (start: Date, end: Date, period: string = 'day') => {
  try {
    const response = await fetch(
      `/api/historical?startDate=${start.getTime()}&endDate=${end.getTime()}&period=${period}`
    );
    const data = await response.json();
    prices.value = data.map((item: any) => ({
      ...item,
      price: Number(item.price)
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
  }
};

const selectPeriod = async (period) => {
  selectedPeriod.value = period;
  // Очищаем текущие данные перед загрузкой новых
  prices.value = [];
  
  if (period.value !== 'custom') {
    const { start, end } = getDateRange(period.value);
    await fetchHistoricalData(start, end, period.value);
  }
};

const applyCustomPeriod = async () => {
  const start = new Date(customStartDate.value);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(customEndDate.value);
  end.setHours(23, 59, 59, 999);
  
  if (start > end) {
    alert('Start date cannot be later than end date');
    return;
  }
  
  await fetchHistoricalData(start, end);
};

// Initial data fetch
onMounted(async () => {
  await fetchCurrentPrice();
  const { start, end } = getDateRange('day');
  await fetchHistoricalData(start, end);
  
  // Update price every minute
  setInterval(fetchCurrentPrice, 60000);
});
</script>
