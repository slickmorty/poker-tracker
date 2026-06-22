import { useMemo } from 'react'
import { Card, StatCard } from './ui/Card'
import { playersWithSessions, playerOneStats } from '../data/store'
import { toman, tomanSigned, jalaliLong } from '../utils/format'
import PlayerSessionNetChart from './charts/PlayerSessionNetChart'
import PlayerCumulativeChart from './charts/PlayerCumulativeChart'
import PlayerWinRateChart from './charts/PlayerWinRateChart'
import PlayerBuyInOutChart from './charts/PlayerBuyInOutChart'

export default function PlayerHistory({ data, playerId, onSelectPlayer }) {
  const activePlayers = useMemo(() => playersWithSessions(data), [data])
  const stats = playerOneStats(data, playerId)

  if (activePlayers.length === 0) {
    return (
      <Card>
        <div className="empty">هنوز بازیکنی در جلسات شرکت نکرده.</div>
      </Card>
    )
  }

  const winRate =
    stats.sessions > 0
      ? Math.round((stats.wins / stats.sessions) * 100)
      : 0

  return (
    <>
      <Card>
        <h2>انتخاب بازیکن</h2>
        <p className="chart-desc">بازیکن خود را انتخاب کنید تا عملکردش را ببینید</p>
        <div className="chip-row player-picker">
          {activePlayers.map(({ player, net }) => (
            <button
              key={player.id}
              type="button"
              className={`chip chip-player ${playerId === player.id ? 'chip-active' : ''}`}
              onClick={() => onSelectPlayer(player.id)}
            >
              <span>{player.name}</span>
              <span className={`chip-net ${net >= 0 ? 'pos' : 'neg'}`}>
                {tomanSigned(net)}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="stats-grid">
        <StatCard
          label="جلسات"
          value={stats.sessions.toLocaleString('fa-IR')}
          sub={`${stats.wins.toLocaleString('fa-IR')} برد · ${stats.losses.toLocaleString('fa-IR')} باخت`}
          accent="blue"
        />
        <StatCard
          label="کل ورود"
          value={toman(stats.buyIn)}
          accent="purple"
        />
        <StatCard
          label="کل خروج"
          value={toman(stats.cashOut)}
          accent="amber"
        />
        <StatCard
          label="سود / زیان کل"
          value={tomanSigned(stats.net)}
          sub={`نرخ برد: ${winRate.toLocaleString('fa-IR')}٪`}
          accent={stats.net >= 0 ? 'green' : undefined}
        />
      </div>

      <div className="charts-grid">
        <Card className="chart-card">
          <h2>سود و زیان هر جلسه</h2>
          <p className="chart-desc">نتیجه {stats.player.name} در هر شب</p>
          <PlayerSessionNetChart data={data} playerId={playerId} />
        </Card>

        <Card className="chart-card">
          <h2>روند تجمعی</h2>
          <p className="chart-desc">سود تجمعی {stats.player.name} در طول زمان</p>
          <PlayerCumulativeChart
            data={data}
            playerId={playerId}
            playerName={stats.player.name}
          />
        </Card>

        <Card className="chart-card">
          <h2>ورود و خروج</h2>
          <p className="chart-desc">مبلغ ورود و خروج در هر جلسه</p>
          <PlayerBuyInOutChart data={data} playerId={playerId} />
        </Card>

        <Card className="chart-card">
          <h2>نسبت برد و باخت</h2>
          <p className="chart-desc">چند جلسه سودده، زیان‌ده یا سر به سر بوده</p>
          <PlayerWinRateChart data={data} playerId={playerId} />
        </Card>
      </div>

      <Card className="no-pad">
        <div className="card-head" style={{ padding: '16px 20px 0' }}>
          <h2>جلسات {stats.player.name}</h2>
        </div>
        {stats.sessionList.length === 0 ? (
          <div className="empty">جلسه‌ای ثبت نشده.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>ورود</th>
                  <th>خروج</th>
                  <th>سود/زیان</th>
                </tr>
              </thead>
              <tbody>
                {stats.sessionList.map((s) => (
                  <tr key={s.sessionId}>
                    <td>
                      <div className="cell-strong">{jalaliLong(s.date)}</div>
                    </td>
                    <td className="num">{toman(s.buyIn)}</td>
                    <td className="num">{toman(s.cashOut)}</td>
                    <td className={`num ${s.net >= 0 ? 'pos' : 'neg'}`}>
                      {tomanSigned(s.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
