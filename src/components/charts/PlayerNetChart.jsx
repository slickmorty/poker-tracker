import { Bar } from 'react-chartjs-2'
import { chartDefaults } from './chartSetup'
import { playerNetChartData } from '../../data/store'
import { tomanNum, tomanSigned } from '../../utils/format'

export default function PlayerNetChart({ data }) {
  const { labels, values } = playerNetChartData(data)

  if (labels.length === 0) return null

  const chartData = {
    labels,
    datasets: [
      {
        label: 'سود / زیان کل',
        data: values,
        backgroundColor: values.map((v) =>
          v >= 0 ? 'rgba(34, 197, 94, 0.75)' : 'rgba(239, 68, 68, 0.75)'
        ),
        borderColor: values.map((v) => (v >= 0 ? '#22c55e' : '#ef4444')),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    indexAxis: 'y',
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
          callback: (v) => tomanNum(v),
        },
      },
      y: {
        ...chartDefaults.scales.y,
        grid: { display: false },
      },
    },
  }

  return (
    <div className="chart-box">
      <Bar data={chartData} options={options} />
    </div>
  )
}
