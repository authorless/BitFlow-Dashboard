<template>
  <div class="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-6 border border-gray-700/50 shadow-2xl">
    <div v-if="!chartDisplayData || chartDisplayData.labels.length === 0" class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <div class="text-6xl mb-6 animate-pulse">₿</div>
        <div class="text-xl font-light">Загрузка данных графика...</div>
        <div class="mt-4 flex justify-center">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="h-full flex flex-col">
      <!-- Индикатор тренда -->
      <div v-if="trendInfo" class="mb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                trendInfo.isPositive ? 'bg-green-400' : 'bg-red-400'
              ]"
              class="animate-pulse"
            ></div>
            <span class="text-sm font-medium text-gray-300">
              {{ trendInfo.isPositive ? 'Рост' : 'Падение' }}
            </span>
          </div>
          <div 
            :class="[
              'text-sm font-bold px-3 py-1 rounded-full',
              trendInfo.isPositive 
                ? 'text-green-300 bg-green-900/30' 
                : 'text-red-300 bg-red-900/30'
            ]"
          >
            {{ trendInfo.isPositive ? '+' : '' }}{{ trendInfo.changePercent.toFixed(2) }}%
          </div>
        </div>
        <div class="text-xs text-gray-400">
          {{ props.period === 'day' ? 'За день' : 
             props.period === 'week' ? 'За неделю' : 
             props.period === 'month' ? 'За месяц' : 
             props.period === 'year' ? 'За год' : 'За период' }}
        </div>
      </div>
      
      <!-- График -->
      <div class="flex-1">
        <Line :data="chartDisplayData" :options="chartOptions" class="h-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';

const props = defineProps<{
  prices: Array<{ timestamp: string | Date; price: number | string }>,
  period?: string
}>();

const formatDate = (date: Date, dataCount: number, period?: string) => {
  // Если период указан явно, используем его для форматирования
  switch (period) {
    case 'day':
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    case 'week':
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short', 
        day: 'numeric'
      });
    case 'month':
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'short'
      });
    case 'year':
      return date.toLocaleDateString('ru-RU', { 
        month: 'short',
        year: 'numeric'
      });
    case 'custom':
      // Для кастомного периода определяем формат по количеству дней
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        return date.toLocaleDateString('ru-RU', { 
          day: 'numeric',
          month: 'short',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffDays <= 31) {
        return date.toLocaleDateString('ru-RU', { 
          day: 'numeric',
          month: 'short'
        });
      } else {
        return date.toLocaleDateString('ru-RU', { 
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    default:
      // Fallback к старой логике
      if (dataCount > 20) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      } else if (dataCount > 7) {
        return date.toLocaleDateString('ru-RU', { 
          weekday: 'short', 
          day: 'numeric'
        });
      } else if (dataCount > 3) {
        return date.toLocaleDateString('ru-RU', { 
          day: 'numeric',
          month: 'short'
        });
      } else {
        return date.toLocaleDateString('ru-RU', { 
          month: 'short',
          year: 'numeric'
        });
      }
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

  return { uniquePrices };
});

const trendInfo = computed(() => {
  const data = chartData.value;
  if (!data || data.uniquePrices.length < 2) return null;

  const firstPrice = data.uniquePrices[0].price;
  const lastPrice = data.uniquePrices[data.uniquePrices.length - 1].price;
  const priceChange = lastPrice - firstPrice;
  const changePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;

  return {
    isPositive: priceChange >= 0,
    changePercent: changePercent,
    priceChange: priceChange
  };
});

const chartDisplayData = computed(() => {
  const data = chartData.value;
  if (!data) return null;

  // Определяем тренд (рост или падение)
  const firstPrice = data.uniquePrices[0]?.price || 0;
  const lastPrice = data.uniquePrices[data.uniquePrices.length - 1]?.price || 0;
  const isPositiveTrend = lastPrice >= firstPrice;

  // Создаем динамический градиент в зависимости от тренда
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const gradient = ctx?.createLinearGradient(0, 0, 0, 400);
  
  if (gradient) {
    if (isPositiveTrend) {
      // Зеленый градиент для роста
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
      gradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.6)');
      gradient.addColorStop(0.7, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
    } else {
      // Красный градиент для падения
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      gradient.addColorStop(0.3, 'rgba(239, 68, 68, 0.6)');
      gradient.addColorStop(0.7, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    }
  }

  // Цвет линии в зависимости от тренда
  const lineColor = isPositiveTrend ? '#22C55E' : '#EF4444';
  const hoverColor = isPositiveTrend ? '#16A34A' : '#DC2626';

  return {
    labels: data.uniquePrices.map(p => formatDate(p.timestamp, data.uniquePrices.length, props.period)),
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: data.uniquePrices.map(p => p.price),
        borderColor: lineColor,
        backgroundColor: gradient || (isPositiveTrend ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: hoverColor,
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 4,
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
        shadowColor: lineColor,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 2
      }
    ]
  };
});

const chartOptions = computed(() => {
  const data = chartData.value;
  if (!data) return {};

  // Определяем тренд для цветов
  const firstPrice = data.uniquePrices[0]?.price || 0;
  const lastPrice = data.uniquePrices[data.uniquePrices.length - 1]?.price || 0;
  const isPositiveTrend = lastPrice >= firstPrice;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;

  return {
    responsive: true,
    maintainAspectRatio: false,    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const,
      delay: (context: any) => context.dataIndex * 20 // Более быстрая анимация точек
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: isPositiveTrend ? '#22C55E' : '#EF4444',
        borderWidth: 2,
        cornerRadius: 16,
        displayColors: false,
        padding: 16,        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13,
          weight: 'normal' as const
        },
        callbacks: {
          title: (context: any) => {
            const date = data.uniquePrices[context[0].dataIndex]?.timestamp;
            if (date) {
              return new Date(date).toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            return '';
          },
          label: (context: any) => {
            return `₿ $${Number(context.raw).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          },
          afterLabel: (context: any) => {
            // Показываем изменение цены относительно первой точки
            const currentPrice = Number(context.raw);
            const change = currentPrice - firstPrice;
            const changePercent = firstPrice > 0 ? ((change / firstPrice) * 100) : 0;
            const changeText = change >= 0 ? '+' : '';
            const arrow = change >= 0 ? '↗' : '↘';
            
            return [
              '',
              `${arrow} ${changeText}$${change.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`,
              `${changeText}${changePercent.toFixed(2)}%`
            ];
          }
        },
        external: (context: any) => {
          // Дополнительные стили для tooltip
          const tooltipEl = context.tooltip;
          if (tooltipEl.opacity === 0) return;
          
          // Добавляем тень
          if (context.chart.canvas) {
            context.chart.canvas.style.filter = 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3))';
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
          display: true,
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
          drawBorder: false
        },
        border: {
          display: false
        },        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: props.period === 'day' ? 12 : props.period === 'week' ? 7 : props.period === 'month' ? 10 : 8,
          font: {
            size: 12,
            weight: 500,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 8
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
          drawBorder: false
        },
        border: {
          display: false
        },        ticks: {
          font: {
            size: 12,
            weight: 500,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 12,
          callback: (value: string | number) => `$${Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })}`
        }
      }
    },
    elements: {
      line: {
        borderWidth: 4,
        tension: 0.4
      },
      point: {
        radius: 0,
        hoverRadius: 10,
        hitRadius: 15,
        borderWidth: 4
      }    }
  } as any;
});
</script>
