import { useState, useMemo, useEffect } from 'react'
import { Card } from './ui/Card'
import { sessionHistory, playersWithSessions } from '../data/store'
import { toman, tomanSigned, jalaliLong, jalaliShort } from '../utils/format'
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

            <div className="session-history">
              {history.map((sess) => {
                const open = expanded === sess.id
                const balanced = sess.totals.delta === 0
                return (
                  <div key={sess.id} className={`session-block ${open ? 'session-open' : ''}`}>
                    <button
                      type="button"
                      className="session-toggle"
                      onClick={() => setExpanded(open ? null : sess.id)}
                      aria-expanded={open}
                    >
                      <span className="session-toggle-icon">{open ? '▼' : '◀'}</span>
                      <span className="session-toggle-main">
                        <span className="session-toggle-date">{jalaliLong(sess.date)}</span>
                        <span className="session-toggle-sub">
                          {sess.rows.length.toLocaleString('fa-IR')} بازیکن · ورود{' '}
                          {toman(sess.totals.buyIn)}
                        </span>
                      </span>
                      <span className="session-toggle-meta">
                        {balanced ? (
                          <span className="badge badge-ok">متعادل</span>
                        ) : (
                          <span className="badge badge-warn">
                            اختلاف {tomanSigned(sess.totals.delta)}
                          </span>
                        )}
                      </span>
                    </button>

                    {open && (
                      <div className="session-detail">
                        <div className="session-detail-head">
                          <span>{jalaliShort(sess.date)}</span>
                          <span>
                            خروج کل: <strong>{toman(sess.totals.cashOut)}</strong>
                          </span>
                        </div>
                        <div className="table-wrap">
                          <table className="table session-players-table">
                            <thead>
                              <tr>
                                <th>بازیکن</th>
                                <th>ورود</th>
                                <th>خروج</th>
                                <th>سود/زیان</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sess.rows.map((row) => (
                                <tr key={row.playerId}>
                                  <td className="cell-strong">{row.name}</td>
                                  <td className="num">{toman(row.buyIn)}</td>
                                  <td className="num">{toman(row.cashOut)}</td>
                                  <td className={`num ${row.net >= 0 ? 'pos' : 'neg'}`}>
                                    {tomanSigned(row.net)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
