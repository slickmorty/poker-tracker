import { useState } from 'react'
import { Card } from './ui/Card'
import Button from './ui/Button'
import SessionHistoryList from './SessionHistoryList'
import { sessionHistory } from '../data/store'

export default function Sessions({ data, onNew, onEdit, onDelete }) {
  const history = sessionHistory(data)
  const [expanded, setExpanded] = useState(history[0]?.id ?? null)

  return (
    <div className="page">
      <div className="page-head">
        <h2>جلسات</h2>
        <Button variant="primary" onClick={onNew}>+ جلسه جدید</Button>
      </div>

      {history.length === 0 ? (
        <Card>
          <div className="empty">
            هنوز جلسه‌ای ثبت نشده. روی «جلسه جدید» بزنید.
          </div>
        </Card>
      ) : (
        <Card>
          <div className="card-head">
            <h2>جزئیات جلسات</h2>
            <span className="hint">کلیک کنید تا باز شود</span>
          </div>
          <SessionHistoryList
            history={history}
            expanded={expanded}
            onToggle={setExpanded}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>
      )}
    </div>
  )
}
