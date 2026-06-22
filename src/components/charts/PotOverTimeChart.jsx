import { Bar } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { potOverTime } from '../../data/store'
import { jalaliShort, tomanNum } from '../../utils/format'

export default function PotOverTimeChart({ data }) {
  const points = potOverTime(data)

  if (points.length === 0) return null

  const chartData = {
    labels: points.map((p) => jalaliShort(p.date)),
    datasets: [
      {
        label: 'کل ورود',
        data: points.map((p) => p.buyIn),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#6366f1',
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
          title: (items) => {
            const idx = items[0]?.dataIndex
            const pt = points[idx]
            if (!pt) return ''
            return `${jalaliShort(pt.date)} · ${pt.playerCount.toLocaleString('fa-IR')} بازیکن`
          },
          label: (ctx) => `ورود: ${tomanNum(ctx.raw)} تومان`,
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
          maxTicksLimit: 12,
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
