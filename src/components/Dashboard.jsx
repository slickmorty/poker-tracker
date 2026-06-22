import { Card, StatCard } from './ui/Card'
import { summary, leaderboard } from '../data/store'
import { toman, tomanSigned, jalaliLong, jalaliShort } from '../utils/format'

export default function Dashboard({ data, goTo }) {
  const s = summary(data)
  const recent = data.sessions.slice(0, 5)
  const board = leaderboard(data).slice(0, 5)

  return (
    <div className="page">
      <div className="stats-grid">
        <StatCard label="بازیکنان" value={s.players.toLocaleString('fa-IR')} accent="blue" />
        <StatCard label="جلسات" value={s.sessions.toLocaleString('fa-IR')} accent="purple" />
        <StatCard
          label="جمع سود بازیکنان"
          value={toman(s.positiveNetSum)}
          accent="amber"
        />
        <StatCard
          label="بهترین بازیکن"
          value={s.top ? s.top.player.name : '—'}
          sub={s.top ? tomanSigned(s.top.net) : 'بدون داده'}
          accent="green"
        />
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-head">
            <h2>جلسات اخیر</h2>
            <button className="link" onClick={() => goTo('sessions')}>
              همه ←
            </button>
          </div>
          {recent.length === 0 ? (
            <Empty text="هنوز جلسه‌ای ثبت نشده." />
          ) : (
            <ul className="recent-list">
              {recent.map((sess) => (
                <li key={sess.id} className="recent-item">
                  <div>
                    <div className="recent-date">{jalaliLong(sess.date)}</div>
                    <div className="recent-sub">{sess.players.length} بازیکن</div>
                  </div>
                  <div className="recent-pot">{toman(sess.players.reduce((a, p) => a + (p.buyIn || 0), 0))}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="card-head">
            <h2>برترین بازیکنان</h2>
            <button className="link" onClick={() => goTo('stats')}>
              همه ←
            </button>
          </div>
          {board.length === 0 ? (
            <Empty text="داده‌ای موجود نیست." />
          ) : (
            <ol className="rank-list">
              {board.map((p, i) => (
                <li key={p.player.id} className="rank-item">
                  <span className={`rank-num rank-${i + 1}`}>
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <span className="rank-name">{p.player.name}</span>
                  <span className={`rank-net ${p.net >= 0 ? 'pos' : 'neg'}`}>
                    {tomanSigned(p.net)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  )
}

function Empty({ text }) {
  return <div className="empty">{text}</div>
}
