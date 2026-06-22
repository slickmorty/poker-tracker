import { useRef, useState } from 'react'
import { Card } from './ui/Card'
import Button from './ui/Button'
import Confirm from './ui/Confirm'
import { exportJson, importJson } from '../data/store'

export default function DataPanel({ data, onImport, onReset }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null) // { type: 'ok'|'err', text }
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmImport, setConfirmImport] = useState(null) // parsed data awaiting confirm

  function handleExport() {
    const blob = new Blob([exportJson(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setMsg({ type: 'ok', text: 'فایل data.json دانلود شد. آن را در گیت‌هاب ذخیره کنید.' })
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = importJson(reader.result)
        setConfirmImport(parsed)
      } catch (err) {
        setMsg({ type: 'err', text: err.message || 'خطا در خواندن فایل.' })
      }
    }
    reader.onerror = () => setMsg({ type: 'err', text: 'خواندن فایل ناموفق بود.' })
    reader.readAsText(file)
  }

  const stats = {
    players: data.players.length,
    sessions: data.sessions.length,
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>مدیریت داده</h2>
      </div>

      <div className="grid-2">
        <Card>
          <h2>وضعیت</h2>
          <ul className="kv">
            <li><span>بازیکنان</span><strong>{stats.players.toLocaleString('fa-IR')}</strong></li>
            <li><span>جلسات</span><strong>{stats.sessions.toLocaleString('fa-IR')}</strong></li>
            <li><span>ذخیره‌سازی</span><strong>محلی (مرورگر)</strong></li>
          </ul>
          <p className="hint">
            داده‌ها در مرورگر شما ذخیره می‌شوند. برای پشتیبان‌گیری یا انتقال، خروجی بگیرید.
          </p>
        </Card>

        <Card>
          <h2>پشتیبان‌گیری</h2>
          <p className="hint">
            خروجی یک فایل <code>data.json</code> با همان ساختار ساده می‌دهد. آن را در گیت‌هاب ذخیره کنید.
          </p>
          <div className="actions-row">
            <Button variant="primary" onClick={handleExport}>⬇ خروجی (data.json)</Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>⬆ ورودی از فایل</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>
          <div className="actions-row">
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              بازنشانی به داده اولیه
            </Button>
          </div>
        </Card>
      </div>

      {msg && (
        <div className={`toast ${msg.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
          {msg.text}
        </div>
      )}

      <Confirm
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          onReset()
          setConfirmReset(false)
          setMsg({ type: 'ok', text: 'داده‌ها به حالت اولیه بازگشت.' })
        }}
        title="بازنشانی داده"
        message="همه داده‌های محلی حذف و به داده اولیه برنامه برمی‌گردد. مطمئن هستید؟"
        confirmLabel="بازنشانی"
        danger
      />

      <Confirm
        open={!!confirmImport}
        onClose={() => setConfirmImport(null)}
        onConfirm={() => {
          onImport(confirmImport)
          setConfirmImport(null)
          setMsg({ type: 'ok', text: 'داده با موفقیت بارگذاری شد.' })
        }}
        title="بارگذاری داده"
        message={`این عمل داده فعلی را با فایل انتخاب شده جایگزین می‌کند (${confirmImport?.players.length || 0} بازیکن، ${confirmImport?.sessions.length || 0} جلسه). ادامه؟`}
        confirmLabel="بارگذاری"
      />
    </div>
  )
}
