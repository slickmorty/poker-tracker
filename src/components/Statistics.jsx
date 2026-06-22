import { Card } from './ui/Card'
import { leaderboard } from '../data/store'
import { toman, tomanSigned } from '../utils/format'

export default function Statistics({ data }) {
  const board = leaderboard(data)
  const totalNet = board.reduce((a, p) => a + p.net, 0)

  return (
    <div className="page">
      <div className="page-head">
        <h2>آمار</h2>
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-head">
            <h2>جدول رده‌بندی</h2>
            <span className={`hint ${totalNet === 0 ? 'ok-text' : 'warn-text'}`}>
              {totalNet === 0 ? 'متعادل ✓' : 'نامتعادل'}
            </span>
          </div>
          {board.length === 0 ? (
            <div className="empty">داده‌ای موجود نیست.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>بازیکن</th>
                    <th>جلسات</th>
                    <th>ورود</th>
                    <th>خروج</th>
                    <th>سود/زیان</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((p, i) => (
                    <tr key={p.player.id}>
                      <td className={`rank-inline rank-${i + 1}`}>
                        {(i + 1).toLocaleString('fa-IR')}
                      </td>
                      <td className="cell-strong">{p.player.name}</td>
                      <td>{p.sessions.toLocaleString('fa-IR')}</td>
                      <td className="num">{toman(p.buyIn)}</td>
                      <td className="num">{toman(p.cashOut)}</td>
                      <td className={`num ${p.net >= 0 ? 'pos' : 'neg'}`}>{tomanSigned(p.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2>نکات</h2>
          <ul className="notes">
            <li>
              مجموع سود و زیان همه بازیکنان باید <strong>صفر</strong> باشد
              (پولی که از دست می‌رود = پولی که برده می‌شود).
            </li>
            <li>
              اگر مجموع صفر نیست، احتمالاً مبلغ ورود/خروج یک بازیکن اشتباه ثبت شده.
            </li>
            <li>
              تمام اعداد به <strong>تومان</strong> و تاریخ‌ها به <strong>تقویم شمسی</strong> نمایش داده می‌شوند.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
