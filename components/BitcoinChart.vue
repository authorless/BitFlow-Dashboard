<template>
  <div class="h-full">
    <div v-if="!chartData || chartData.labels.length === 0" class="h-full flex items-center justify-center text-gray-500">
      <div class="text-center">
        <div class="text-lg mb-2">📊</div>
        <div>Загрузка данных графика...</div>
      </div>
    </div>
    <Line v-else :data="chartData" :options="chartOptions" class="h-full" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';

const props = defineProps<{
  prices: Array<{ timestamp: string | Date; price: number | string }>
}>();

const formatDate = (date: Date) => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const chartData = computed(() => {
  if (!props.prices || props.prices.length === 0) {
    return null;
  }

  console.log('Raw prices data:', props.prices);

  // Сортируем данные по времени и удаляем дубликаты
  const uniquePrices = props.prices
    .map(p => ({
      timestamp: typeof p.timestamp === 'string' ? new Date(p.timestamp) : p.timestamp,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
    }))
    .filter(p => !isNaN(p.price) && p.timestamp instanceof Date && !isNaN(p.timestamp.getTime()))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .filter((price, index, self) => 
      index === self.findIndex(p => 
        p.timestamp.getTime() === price.timestamp.getTime()
      )
    );

  console.log('Processed prices data:', uniquePrices);

  if (uniquePrices.length === 0) {
    return null;
  }

  return {
    labels: uniquePrices.map(p => formatDate(p.timestamp)),
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: uniquePrices.map(p => p.price),
        borderColor: '#F7931A',
        backgroundColor: 'rgba(247, 147, 26, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `Price: $${Number(context.raw).toLocaleString()}`;
        }
      }
    },
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10
      }
    },
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: (value: string | number) => `$${Number(value).toLocaleString()}`
      }
    }
  }
};
</script>
