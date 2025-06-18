<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions" class="h-full" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  prices: Array<{ timestamp: string; price: number }>
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
  // Сортируем данные по времени и удаляем дубликаты
  const uniquePrices = props.prices
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .filter((price, index, self) => 
      index === self.findIndex(p => 
        new Date(p.timestamp).getTime() === new Date(price.timestamp).getTime()
      )
    );

  return {
    labels: uniquePrices.map(p => formatDate(new Date(p.timestamp))),
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: uniquePrices.map(p => typeof p.price === 'string' ? parseFloat(p.price) : p.price),
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
    mode: 'index'
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
        callback: (value: number) => `$${value.toLocaleString()}`
      }
    }
  }
};
</script>
