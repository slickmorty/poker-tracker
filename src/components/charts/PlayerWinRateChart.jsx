import { Doughnut } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { playerOneStats } from '../../data/store'

export default function PlayerWinRateChart({ data, playerId }) {
  const { wins, losses, breaks } = playerOneStats(data, playerId)
  const total = wins + losses + breaks

  if (total === 0) return null

  const chartData = {
    labels: ['سودده', 'زیان‌ده', 'سر به سر'],
    datasets: [
      {
        data: [wins, losses, breaks],
        backgroundColor: [
          'rgba(34, 197, 94, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(107, 113, 134, 0.65)',
        ],
        borderColor: ['#22c55e', '#ef4444', '#6b7186'],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    cutout: '62%',
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        ...chartDefaults.plugins.legend,
        position: 'bottom',
      },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx) => {
            const pct = Math.round((ctx.raw / total) * 100)
            return `${ctx.label}: ${ctx.raw.toLocaleString('fa-IR')} جلسه (${pct.toLocaleString('fa-IR')}٪)`
          },
        },
      },
    },
  }

  return (
    <div className="chart-box chart-box-doughnut">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
