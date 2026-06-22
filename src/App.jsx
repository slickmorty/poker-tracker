import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Sessions from './components/Sessions'
import SessionForm from './components/SessionForm'
import Players from './components/Players'
import Statistics from './components/Statistics'
import History from './components/History'
import DataPanel from './components/DataPanel'
import Confirm from './components/ui/Confirm'
import {
  loadInitial,
  persist,
  normalize,
  clearStored,
  emptyData,
} from './data/store'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState(() => emptyData())
  const [loading, setLoading] = useState(true)

  // Session form state
  const [sessionForm, setSessionForm] = useState({ open: false, initial: null })
  const [deleteSession, setDeleteSession] = useState(null)
  // Player deletion confirm
  const [deletePlayer, setDeletePlayer] = useState(null)
  const [historyPlayerId, setHistoryPlayerId] = useState(null)

  function goToPlayerHistory(playerId) {
    setHistoryPlayerId(playerId)
    setTab('history')
  }

  // Load on mount (localStorage first, else seed).
  useEffect(() => {
    let alive = true
    loadInitial().then((d) => {
      if (alive) {
        setData(d)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  // Autosave on every change (after initial load).
  useEffect(() => {
    if (!loading) persist(data)
  }, [data, loading])

  // --- Session mutations ---
  function openNewSession() {
    setSessionForm({ open: true, initial: null })
  }
  function openEditSession(sess) {
    setSessionForm({ open: true, initial: sess })
  }
  function saveSession(session) {
    setData((d) => {
      const exists = d.sessions.some((s) => s.id === session.id)
      const sessions = exists
        ? d.sessions.map((s) => (s.id === session.id ? session : s))
        : [...d.sessions, session]
      return normalize({ ...d, sessions })
    })
    setSessionForm({ open: false, initial: null })
  }
  function confirmDeleteSession(sess) {
    setData((d) => ({
      ...d,
      sessions: d.sessions.filter((s) => s.id !== sess.id),
    }))
    setDeleteSession(null)
  }

  // --- Player mutations ---
  function addPlayer(player) {
    setData((d) => ({ ...d, players: [...d.players, player] }))
  }
  function updatePlayer(oldId, player) {
    setData((d) => {
      // rename player id across sessions too
      const players = d.players.map((p) => (p.id === oldId ? player : p))
      const sessions = d.sessions.map((s) => ({
        ...s,
        players: s.players.map((row) =>
          row.playerId === oldId ? { ...row, playerId: player.id } : row
        ),
      }))
      return normalize({ ...d, players, sessions })
    })
  }
  function confirmDeletePlayer(player) {
    setData((d) => ({
      ...d,
      players: d.players.filter((p) => p.id !== player.id),
      sessions: d.sessions.map((s) => ({
        ...s,
        players: s.players.filter((row) => row.playerId !== player.id),
      })),
    }))
    setDeletePlayer(null)
  }

  // --- Data panel mutations ---
  function handleImport(imported) {
    setData(normalize(imported))
  }
  async function handleReset() {
    clearStored()
    setData(emptyData())
    const seed = await loadInitial()
    setData(seed)
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
        <p>در حال بارگذاری…</p>
      </div>
    )
  }

  return (
    <Layout tab={tab} setTab={setTab}>
      {tab === 'dashboard' && <Dashboard data={data} goTo={setTab} />}

      {tab === 'sessions' && (
        <Sessions
          data={data}
          onNew={openNewSession}
          onEdit={openEditSession}
          onDelete={setDeleteSession}
        />
      )}

      {tab === 'players' && (
        <Players
          data={data}
          onAdd={addPlayer}
          onUpdate={updatePlayer}
          onDelete={setDeletePlayer}
          onViewHistory={goToPlayerHistory}
        />
      )}

      {tab === 'history' && (
        <History
          data={data}
          initialPlayerId={historyPlayerId}
          onPlayerViewed={() => setHistoryPlayerId(null)}
        />
      )}

      {tab === 'stats' && <Statistics data={data} />}

      {tab === 'data' && (
        <DataPanel data={data} onImport={handleImport} onReset={handleReset} />
      )}

      <SessionForm
        open={sessionForm.open}
        initial={sessionForm.initial}
        data={data}
        onClose={() => setSessionForm({ open: false, initial: null })}
        onSave={saveSession}
      />

      <Confirm
        open={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={() => confirmDeleteSession(deleteSession)}
        title="حذف جلسه"
        message="این جلسه حذف شود؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        danger
      />

      <Confirm
        open={!!deletePlayer}
        onClose={() => setDeletePlayer(null)}
        onConfirm={() => confirmDeletePlayer(deletePlayer)}
        title="حذف بازیکن"
        message={
          deletePlayer
            ? `«${deletePlayer.name}» از لیست بازیکنان و تمام جلسات حذف شود؟`
            : ''
        }
        confirmLabel="حذف"
        danger
      />
    </Layout>
  )
}
