import { Line } from 'react-chartjs-2'
import { CHART_COLORS, chartDefaults } from './chartSetup'
import { cumulativeNetSeries } from '../../data/store'
import { jalaliShort, tomanSigned } from '../../utils/format'

export default function CumulativeNetChart({ data }) {
  const { labels, series } = cumulativeNetSeries(data, 5)

  if (labels.length === 0) return null

  const chartData = {
    labels: labels.map(jalaliShort),
    datasets: series.map((s, i) => ({
      label: s.name,
      data: s.data,
      borderColor: CHART_COLORS[i % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '22',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
    })),
  }

  const options = {
    ...chartDefaults,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${tomanSigned(ctx.raw)}`,
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
