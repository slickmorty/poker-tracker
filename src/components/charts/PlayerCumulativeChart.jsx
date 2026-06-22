import { Line } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { playerChartSeries } from '../../data/store'
import { jalaliShort, tomanSigned } from '../../utils/format'

export default function PlayerCumulativeChart({ data, playerId, playerName }) {
  const { labels, cumulative } = playerChartSeries(data, playerId)

  if (labels.length === 0) return null

  const last = cumulative[cumulative.length - 1] ?? 0
  const color = last >= 0 ? '#22c55e' : '#ef4444'

  const chartData = {
    labels: labels.map(jalaliShort),
    datasets: [
      {
        label: playerName ?? 'سود تجمعی',
        data: cumulative,
        borderColor: color,
        backgroundColor: last >= 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx) => `سود تجمعی: ${tomanSigned(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        ...chartDefaults.scales.x,
        ticks: {
          ...chartDefaults.scales.x.ticks,
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 14,
        },
      },
      y: {
        ...chartDefaults.scales.y,
        ticks: {
          ...chartDefaults.scales.y.ticks,
          callback: (v) => tomanSigned(v).replace(' تومان', ''),
        },
      },
    },
  }

  return (
    <div className="chart-box">
      <Line data={chartData} options={options} />
    </div>
  )
}
