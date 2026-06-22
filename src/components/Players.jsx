import { useState } from 'react'
import { Card } from './ui/Card'
import Button from './ui/Button'
import Modal from './ui/Modal'
import { playerStats } from '../data/store'
import { tomanSigned, toman } from '../utils/format'
import { slugify, uniquePlayerId } from '../utils/id'

export default function Players({ data, onAdd, onUpdate, onDelete, onViewHistory }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [id, setId] = useState('')

  const stats = playerStats(data)

  function openNew() {
    setEditing(null)
    setName('')
    setId('')
    setOpen(true)
  }
  function openEdit(p) {
    setEditing(p)
    setName(p.name)
    setId(p.id)
    setOpen(true)
  }

  function handleNameChange(v) {
    setName(v)
    // auto-suggest id for new players only
    if (!editing) setId(slugify(v))
  }

  function handleSave() {
    if (!name.trim()) return
    if (!editing) {
      const finalId = uniquePlayerId(
        id.trim() || slugify(name),
        data.players.map((p) => p.id)
      )
      onAdd({ id: finalId, name: name.trim() })
    } else {
      onUpdate(editing.id, { id: id.trim() || editing.id, name: name.trim() })
    }
    setOpen(false)
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>بازیکنان</h2>
        <Button variant="primary" onClick={openNew}>+ بازیکن جدید</Button>
      </div>

      {data.players.length === 0 ? (
        <Card>
          <div className="empty">هنوز بازیکنی اضافه نشده.</div>
        </Card>
      ) : (
        <Card className="no-pad">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>شناسه</th>
                  <th>جلسات</th>
                  <th>کل ورود</th>
                  <th>سود/زیان</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.map(({ player, sessions, buyIn, net }) => (
                  <tr key={player.id}>
                    <td className="cell-strong">{player.name}</td>
                    <td className="mono">{player.id}</td>
                    <td>{sessions.toLocaleString('fa-IR')}</td>
                    <td className="num">{toman(buyIn)}</td>
                    <td className={`num ${net >= 0 ? 'pos' : 'neg'}`}>{tomanSigned(net)}</td>
                    <td className="actions">
                      {sessions > 0 && onViewHistory && (
                        <button
                          className="icon-btn"
                          onClick={() => onViewHistory(player.id)}
                          title="مشاهده آمار"
                        >
                          📈
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => openEdit(player)} title="ویرایش">✏️</button>
                      <button className="icon-btn danger" onClick={() => onDelete(player)} title="حذف">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'ویرایش بازیکن' : 'بازیکن جدید'}>
        <div className="form">
          <div className="field">
            <label>نام</label>
            <input
              className="input"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثلاً احمد"
              autoFocus
            />
          </div>
          <div className="field">
            <label>شناسه (کوتاه، انگلیسی)</label>
            <input
              className="input mono"
              dir="ltr"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ahmad-abasi"
            />
            <div className="hint">شناسه باید یکتا باشد. در داده‌های خام هم همین مقدار استفاده می‌شود.</div>
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>انصراف</Button>
            <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
              {editing ? 'ذخیره' : 'افزودن'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
