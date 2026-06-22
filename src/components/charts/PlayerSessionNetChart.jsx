import { Bar } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { playerChartSeries } from '../../data/store'
import { jalaliShort, tomanSigned } from '../../utils/format'

export default function PlayerSessionNetChart({ data, playerId }) {
  const { labels, nets } = playerChartSeries(data, playerId)

  if (labels.length === 0) return null

  const chartData = {
    labels: labels.map(jalaliShort),
    datasets: [
      {
        label: 'سود / زیان',
        data: nets,
        backgroundColor: nets.map((v) =>
          v >= 0 ? 'rgba(34, 197, 94, 0.75)' : 'rgba(239, 68, 68, 0.75)'
        ),
        borderColor: nets.map((v) => (v >= 0 ? '#22c55e' : '#ef4444')),
        borderWidth: 1,
        borderRadius: 6,
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
          label: (ctx) => tomanSigned(ctx.raw),
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
      <Bar data={chartData} options={options} />
    </div>
  )
}
