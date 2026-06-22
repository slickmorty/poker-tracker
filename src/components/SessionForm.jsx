import { useMemo, useState, useEffect } from 'react'
import DatePicker from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import DateObject from 'react-date-object'
import Modal from './ui/Modal'
import Button from './ui/Button'
import TomanInput from './ui/TomanInput'
import { toman, jalaliLong, jalaliToIso, todayIso, tomanSigned } from '../utils/format'
import { nextSessionId } from '../utils/id'

const BUY_IN_SUGGESTIONS = [100000, 200000, 300000, 400000 , 600000, 800000, 1000000]

// Build a DateObject for the DatePicker from a Gregorian ISO date.
function isoToJalaliObj(iso) {
  return new DateObject({
    date: iso,
    format: 'YYYY-MM-DD',
    calendar: gregorian,
  }).convert(persian, persian_fa)
}
export default function SessionForm({
  open,
  onClose,
  data,
  initial, // session to edit, or null for new
  onSave, // (session) => void
}) {
  const editingId = initial?.id ?? null
  const existingIds = data.sessions.map((s) => s.id)
  const allPlayerIds = data.players.map((p) => p.id)

  const [date, setDate] = useState(
    initial?.date ? isoToJalaliObj(initial.date) : isoToJalaliObj(todayIso())
  )
  const [dateError, setDateError] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')

  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase()
    if (!q) return data.players
    return data.players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    )
  }, [data.players, playerSearch])

  // rows: { playerId, buyIn, cashOut }
  const [rows, setRows] = useState(() => {
    if (initial?.players?.length) {
      return initial.players.map((p) => ({
        playerId: p.playerId,
        buyIn: p.buyIn || 0,
        cashOut: p.cashOut || 0,
      }))
    }
    return []
  })

  useEffect(() => {
    if (!open) return
    setDate(
      initial?.date ? isoToJalaliObj(initial.date) : isoToJalaliObj(todayIso())
    )
    setRows(
      initial?.players?.length
        ? initial.players.map((p) => ({
            playerId: p.playerId,
            buyIn: p.buyIn || 0,
            cashOut: p.cashOut || 0,
          }))
        : []
    )
    setDateError('')
    setPlayerSearch('')
  }, [open, initial])

  const selectedIds = rows.map((r) => r.playerId)

  const totals = useMemo(() => {
    const buyIn = rows.reduce((a, r) => a + (r.buyIn || 0), 0)
    const cashOut = rows.reduce((a, r) => a + (r.cashOut || 0), 0)
    return { buyIn, cashOut, delta: cashOut - buyIn }
  }, [rows])

  function togglePlayer(playerId) {
    if (selectedIds.includes(playerId)) {
      setRows((rs) => rs.filter((r) => r.playerId !== playerId))
    } else {
      setRows((rs) => [...rs, { playerId, buyIn: 0, cashOut: 0 }])
      setPlayerSearch('')
    }
  }

  function handlePlayerSearchKeyDown(e) {
    if (e.key !== 'Enter' || filteredPlayers.length !== 1) return
    e.preventDefault()
    togglePlayer(filteredPlayers[0].id)
  }

  function setRow(playerId, field, value) {
    setRows((rs) => rs.map((r) => (r.playerId === playerId ? { ...r, [field]: value } : r)))
  }

  const iso = jalaliToIso(date)

  function handleSave() {
    if (!iso) {
      setDateError('تاریخ را انتخاب کنید.')
      return
    }
    if (rows.length === 0) {
      setDateError('حداقل یک بازیکن اضافه کنید.')
      return
    }
    const cleanRows = rows
      .filter((r) => r.playerId)
      .map((r) => ({
        playerId: r.playerId,
        buyIn: Math.round(Number(r.buyIn) || 0),
        cashOut: Math.round(Number(r.cashOut) || 0),
      }))

    let id
    if (editingId) {
      id = editingId // keep original id on edit
    } else {
      id = nextSessionId(iso, existingIds)
    }
    const session = { id, date: iso, players: cleanRows }
    onSave(session)
  }

  return (
    <Modal open={open} onClose={onClose} title={editingId ? 'ویرایش جلسه' : 'جلسه جدید'} wide>
      <div className="form">
        {/* Date */}
        <div className="field">
          <label>تاریخ جلسه</label>
          <div className="date-picker-wrap">
            <DatePicker
              value={date}
              onChange={(v) => {
                setDate(v)
                setDateError('')
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              inputClass="input"
              style={{ width: '100%' }}
            />
          </div>
          {date ? (
            <div className="hint">{jalaliLong(iso)}</div>
          ) : null}
        </div>

        {/* Player picker */}
        <div className="field">
          <label>بازیکنان</label>
          {data.players.length === 0 ? (
            <div className="empty inline">
              ابتدا از تب «بازیکنان» بازیکن اضافه کنید.
            </div>
          ) : (
            <>
              <input
                type="search"
                className="input player-search"
                placeholder="جستجو با نام… (Enter برای افزودن)"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                onKeyDown={handlePlayerSearchKeyDown}
              />
              {selectedIds.length > 0 && (
                <div className="hint">
                  {selectedIds.length.toLocaleString('fa-IR')} بازیکن انتخاب شده
                </div>
              )}
              {filteredPlayers.length === 0 ? (
                <div className="empty inline">بازیکنی با این نام پیدا نشد.</div>
              ) : (
                <div className="chip-row">
                  {filteredPlayers.map((p) => {
                    const active = selectedIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`chip ${active ? 'chip-active' : ''}`}
                        onClick={() => togglePlayer(p.id)}
                      >
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Per-player amounts */}
        {rows.length > 0 && (
          <div className="field">
            <label>مبالغ ورود و خروج</label>
            <div className="amounts">
              {rows.map((r) => {
                const player = data.players.find((p) => p.id === r.playerId)
                const net = (r.cashOut || 0) - (r.buyIn || 0)
                return (
                  <div key={r.playerId} className="amount-row">
                    <div className="amount-name">{player?.name || r.playerId}</div>
                    <TomanInput
                      value={r.buyIn}
                      onChange={(v) => setRow(r.playerId, 'buyIn', v)}
                      placeholder="ورود"
                      aria-label={`ورود ${player?.name || r.playerId}`}
                      suggestions={BUY_IN_SUGGESTIONS}
                    />
                    <TomanInput
                      value={r.cashOut}
                      onChange={(v) => setRow(r.playerId, 'cashOut', v)}
                      placeholder="خروج"
                      aria-label={`خروج ${player?.name || r.playerId}`}
                    />
                    <div className={`amount-net ${net >= 0 ? 'pos' : 'neg'}`}>
                      {net >= 0 ? '+' : '−'}
                      {toman(Math.abs(net))}
                    </div>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => togglePlayer(r.playerId)}
                      title="حذف از جلسه"
                    >✕</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Live totals */}
        <div className="totals-bar">
          <div className="totals-item">
            <span>کل ورود</span>
            <strong>{toman(totals.buyIn)}</strong>
          </div>
          <div className="totals-item">
            <span>کل خروج</span>
            <strong>{toman(totals.cashOut)}</strong>
          </div>
          <div className={`totals-item ${totals.delta === 0 ? 'ok' : 'warn'}`}>
            <span>اختلاف</span>
            <strong>{tomanSigned(totals.delta)}</strong>
          </div>
        </div>
        {totals.delta !== 0 && (
          <div className="hint warn-text">
            مجموع ورود و خروج برابر نیست. معمولاً باید صفر باشد.
          </div>
        )}

        {dateError && <div className="hint warn-text">{dateError}</div>}

        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button variant="primary" onClick={handleSave}>
            {editingId ? 'ذخیره تغییرات' : 'ثبت جلسه'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
