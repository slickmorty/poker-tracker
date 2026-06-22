import { Bar } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { playerChartSeries } from '../../data/store'
import { jalaliShort, tomanNum } from '../../utils/format'

export default function PlayerBuyInOutChart({ data, playerId }) {
  const { labels, buyIns, cashOuts } = playerChartSeries(data, playerId)

  if (labels.length === 0) return null

  const chartData = {
    labels: labels.map(jalaliShort),
    datasets: [
      {
        label: 'ورود',
        data: buyIns,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'خروج',
        data: cashOuts.map(Math.abs),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: '#a855f7',
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
          label: (ctx) => {
            const raw = ctx.datasetIndex === 1 ? cashOuts[ctx.dataIndex] : ctx.raw
            const sign = ctx.datasetIndex === 1 && raw < 0 ? '−' : ''
            return `${ctx.dataset.label}: ${sign}${tomanNum(Math.abs(raw))} تومان`
          },
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
          callback: (v) => tomanNum(v),
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
