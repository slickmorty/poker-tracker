import { useState, useMemo, useEffect } from 'react'
import { Card } from './ui/Card'
import { sessionHistory, playersWithSessions } from '../data/store'
import SessionHistoryList from './SessionHistoryList'
import PlayerNetChart from './charts/PlayerNetChart'
import CumulativeNetChart from './charts/CumulativeNetChart'
import PotOverTimeChart from './charts/PotOverTimeChart'
import WinLossChart from './charts/WinLossChart'
import PlayerHistory from './PlayerHistory'

const VIEWS = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'player', label: 'بازیکن' },
]

export default function History({ data, initialPlayerId, onPlayerViewed }) {
  const history = sessionHistory(data)
  const activePlayers = useMemo(() => playersWithSessions(data), [data])
  const [view, setView] = useState(initialPlayerId ? 'player' : 'overview')
  const [expanded, setExpanded] = useState(history[0]?.id ?? null)
  const [playerId, setPlayerId] = useState(
    () => initialPlayerId ?? activePlayers[0]?.player.id ?? null
  )

  useEffect(() => {
    if (initialPlayerId) {
      setView('player')
      setPlayerId(initialPlayerId)
      onPlayerViewed?.()
    }
  }, [initialPlayerId, onPlayerViewed])

  const hasData = data.sessions.length > 0

  return (
    <div className="page">
      <div className="page-head">
        <h2>تاریخچه</h2>
        {hasData && (
          <div className="view-toggle">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`view-btn ${view === v.id ? 'view-btn-active' : ''}`}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <Card>
          <div className="empty">هنوز جلسه‌ای ثبت نشده. از تب «جلسات» یک جلسه اضافه کنید.</div>
        </Card>
      ) : view === 'player' ? (
        <PlayerHistory
          data={data}
          playerId={playerId ?? activePlayers[0]?.player.id}
          onSelectPlayer={setPlayerId}
        />
      ) : (
        <>
          <div className="charts-grid">
            <Card className="chart-card">
              <h2>سود و زیان بازیکنان</h2>
              <p className="chart-desc">مجموع سود یا زیان هر بازیکن در تمام جلسات</p>
              <PlayerNetChart data={data} />
            </Card>

            <Card className="chart-card">
              <h2>روند تجمعی سود</h2>
              <p className="chart-desc">۵ بازیکن برتر — سود تجمعی در طول زمان</p>
              <CumulativeNetChart data={data} />
            </Card>

            <Card className="chart-card">
              <h2>حجم پول هر جلسه</h2>
              <p className="chart-desc">مجموع ورود (buy-in) در هر شب</p>
              <PotOverTimeChart data={data} />
            </Card>

            <Card className="chart-card">
              <h2>برد و باخت در جلسات</h2>
              <p className="chart-desc">تعداد جلساتی که هر بازیکن سودده یا زیان‌ده بوده</p>
              <WinLossChart data={data} />
            </Card>
          </div>

          <Card>
            <div className="card-head">
              <h2>جزئیات جلسات</h2>
              <span className="hint">کلیک کنید تا باز شود</span>
            </div>

            <SessionHistoryList
              history={history}
              expanded={expanded}
              onToggle={setExpanded}
            />
          </Card>
        </>
      )}
    </div>
  )
}
