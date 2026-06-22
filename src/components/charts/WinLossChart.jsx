import { Bar } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { sessionWinLossData } from '../../data/store'

export default function WinLossChart({ data }) {
  const { labels, wins, losses } = sessionWinLossData(data, 8)

  if (labels.length === 0) return null

  const chartData = {
    labels,
    datasets: [
      {
        label: 'جلسات سودده',
        data: wins,
        backgroundColor: 'rgba(34, 197, 94, 0.75)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'جلسات زیان‌ده',
        data: losses,
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${ctx.raw.toLocaleString('fa-IR')} جلسه`,
        },
      },
    },
    scales: {
      x: {
        ...chartDefaults.scales.x,
        stacked: true,
        ticks: { ...chartDefaults.scales.x.ticks, maxRotation: 30 },
      },
      y: {
        ...chartDefaults.scales.y,
        stacked: true,
        ticks: {
          ...chartDefaults.scales.y.ticks,
          stepSize: 1,
          callback: (v) => v.toLocaleString('fa-IR'),
        },
      },
    },
  }

  return (
    <div className="chart-box">
      <Bar data={chartData} options={options} />
    </div>
  )
}
