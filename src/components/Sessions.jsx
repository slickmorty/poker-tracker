import { Card } from './ui/Card'
import Button from './ui/Button'
import { sessionTotals, sessionsByDateDesc } from '../data/store'
import { toman, jalaliLong, jalaliShort } from '../utils/format'

export default function Sessions({ data, onNew, onEdit, onDelete }) {
  const sessions = sessionsByDateDesc(data.sessions)

  return (
    <div className="page">
      <div className="page-head">
        <h2>جلسات</h2>
        <Button variant="primary" onClick={onNew}>+ جلسه جدید</Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="empty">
            هنوز جلسه‌ای ثبت نشده. روی «جلسه جدید» بزنید.
          </div>
        </Card>
      ) : (
        <Card className="no-pad">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>بازیکنان</th>
                  <th>کل ورود</th>
                  <th>کل خروج</th>
                  <th>متعادل</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => {
                  const t = sessionTotals(sess)
                  const balanced = t.delta === 0
                  return (
                    <tr key={sess.id}>
                      <td>
                        <div className="cell-strong">{jalaliLong(sess.date)}</div>
                        <div className="cell-sub">{jalaliShort(sess.date)}</div>
                      </td>
                      <td>{sess.players.length.toLocaleString('fa-IR')}</td>
                      <td className="num">{toman(t.buyIn)}</td>
                      <td className="num">{toman(t.cashOut)}</td>
                      <td>
                        {balanced ? (
                          <span className="badge badge-ok">✓ بله</span>
                        ) : (
                          <span className="badge badge-warn" title="مجموع ورود و خروج برابر نیست">
                            اختلاف {tomanSigned(t.delta)}
                          </span>
                        )}
                      </td>
                      <td className="actions">
                        <button className="icon-btn" onClick={() => onEdit(sess)} title="ویرایش">✏️</button>
                        <button
                          className="icon-btn danger"
                          onClick={() => onDelete(sess)}
                          title="حذف"
                        >🗑️</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
