import { toman, tomanSigned, jalaliLong, jalaliShort } from '../utils/format'

export default function SessionHistoryList({
  history,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <div className="session-history">
      {history.map((sess) => {
        const open = expanded === sess.id
        const balanced = sess.totals.delta === 0
        return (
          <div key={sess.id} className={`session-block ${open ? 'session-open' : ''}`}>
            <div className="session-head">
              <button
                type="button"
                className="session-toggle"
                onClick={() => onToggle(open ? null : sess.id)}
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
              </button>
              <span className="session-toggle-meta">
                {balanced ? (
                  <span className="badge badge-ok">متعادل</span>
                ) : (
                  <span className="badge badge-warn">
                    اختلاف {tomanSigned(sess.totals.delta)}
                  </span>
                )}
              </span>
              {(onEdit || onDelete) && (
                <div className="session-actions">
                  {onEdit && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onEdit(sess)}
                      title="ویرایش"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => onDelete(sess)}
                      title="حذف"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>

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
  )
}
