import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export const CHART_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#a855f7',
  '#14b8a6',
  '#ec4899',
  '#f97316',
  '#84cc16',
  '#06b6d4',
  '#eab308',
]

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9aa0b4',
        font: { family: 'Vazirmatn', size: 12 },
        padding: 14,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#1b2030',
      borderColor: '#2a3145',
      borderWidth: 1,
      titleColor: '#e7e9f3',
      bodyColor: '#9aa0b4',
      titleFont: { family: 'Vazirmatn', size: 13 },
      bodyFont: { family: 'Vazirmatn', size: 12 },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      ticks: { color: '#6b7186', font: { family: 'Vazirmatn', size: 11 } },
      grid: { color: 'rgba(42, 49, 69, 0.5)' },
      border: { color: '#2a3145' },
    },
    y: {
      ticks: { color: '#6b7186', font: { family: 'Vazirmatn', size: 11 } },
      grid: { color: 'rgba(42, 49, 69, 0.5)' },
      border: { color: '#2a3145' },
    },
  },
}
