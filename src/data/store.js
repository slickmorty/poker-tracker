// Single source of truth for poker data.
// - Seed comes from /data.json (shipped in public/).
// - Edits autosave to localStorage for smooth daily admin.
// - Import/export/reset in DataPanel covers backup (git commit of data.json).
//
// Schema is intentionally minimal and human-editable:
//   { players: [{id,name}], sessions: [{id,date,players:[{playerId,buyIn,cashOut}]}] }
// Profit/loss and statistics are NEVER stored — all derived here.

import { toAsciiDigits } from '../utils/digits'

const LS_KEY = 'poker-data-v1'

export const SEED_URL = './data.json'

export function emptyData() {
  return { players: [], sessions: [] }
}

// --- Load ---
export async function loadInitial() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) return normalize(JSON.parse(saved))
  } catch {
    /* fall through to seed */
  }
  // First run: fetch the bundled seed.
  try {
    const res = await fetch(SEED_URL)
    if (!res.ok) throw new Error('seed fetch failed')
    return normalize(await res.json())
  } catch {
    return emptyData()
  }
}

// --- Save ---
export function persist(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {
    /* storage full / unavailable — UI keeps working in-memory */
  }
}

export function clearStored() {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}

// --- Export (pretty, exact schema) ---
export function exportJson(data) {
  return JSON.stringify(data, null, 2)
}

// --- Import (validate + normalize) ---
export function importJson(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('فایل JSON نامعتبر است.')
  }
  return normalize(parsed)
}

// Defensive normalization: ensures shape, integer Toman values, sorted.
export function normalize(data) {
  const players = Array.isArray(data?.players)
    ? data.players
        .filter((p) => p && (p.id || p.name))
        .map((p) => ({
          id: String(p.id ?? slug(p.name)),
          name: String(p.name ?? p.id),
        }))
    : []

  const sessions = Array.isArray(data?.sessions)
    ? data.sessions
        .filter((s) => s && s.id)
        .map((s) => ({
          id: toAsciiDigits(String(s.id)),
          date: toAsciiDigits(String(s.date ?? s.id)),
          players: Array.isArray(s.players)
            ? s.players
                .filter((x) => x && x.playerId)
                .map((x) => ({
                  playerId: String(x.playerId),
                  buyIn: toInt(x.buyIn),
                  cashOut: toInt(x.cashOut),
                }))
            : [],
        }))
    : []

  sessions.sort(byDateDesc)
  return { players, sessions }
}

function slug(name) {
  return String(name || 'player')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'player'
}
function toInt(v) {
  const n = Number(String(v).replace(/[^\d-]/g, ''))
  return Number.isFinite(n) ? Math.round(n) : 0
}
function byDateDesc(a, b) {
  const byDate = b.date.localeCompare(a.date)
  if (byDate !== 0) return byDate
  return b.id.localeCompare(a.id)
}

// Newest session date first (tie-break by id).
export function sessionsByDateDesc(sessions) {
  return [...sessions].sort(byDateDesc)
}

// --- Derived: everything below is computed, never stored ---

// Per-session totals: total buy-in, total cash-out, balance delta.
export function sessionTotals(session) {
  let buyIn = 0,
    cashOut = 0
  for (const p of session.players ?? []) {
    buyIn += toInt(p.buyIn)
    cashOut += toInt(p.cashOut)
  }
  return { buyIn, cashOut, delta: cashOut - buyIn }
}

// All-time stats per player: { sessions, buyIn, cashOut, net }.
export function playerStats(data) {
  const map = new Map()
  for (const p of data.players) {
    map.set(p.id, { player: p, sessions: 0, buyIn: 0, cashOut: 0, net: 0 })
  }
  for (const s of data.sessions) {
    for (const row of s.players ?? []) {
      if (!map.has(row.playerId)) {
        // unknown player referenced in a session — synthesize a stub
        map.set(row.playerId, {
          player: { id: row.playerId, name: row.playerId },
          sessions: 0,
          buyIn: 0,
          cashOut: 0,
          net: 0,
        })
      }
      const st = map.get(row.playerId)
      st.sessions += 1
      st.buyIn += toInt(row.buyIn)
      st.cashOut += toInt(row.cashOut)
      st.net += toInt(row.cashOut) - toInt(row.buyIn)
    }
  }
  return Array.from(map.values())
}

// Leaderboard: players sorted by net profit, descending.
export function leaderboard(data) {
  return playerStats(data).sort((a, b) => b.net - a.net)
}

// Player id → name lookup.
export function playerMap(data) {
  const m = new Map()
  for (const p of data.players) m.set(p.id, p.name)
  return m
}

// Sessions newest-first with per-player net and totals attached.
export function sessionHistory(data) {
  const names = playerMap(data)
  return sessionsByDateDesc(data.sessions).map((s) => enrichSession(s, names))
}

function enrichSession(session, names) {
  const rows = (session.players ?? [])
    .map((row) => ({
      ...row,
      name: names.get(row.playerId) ?? row.playerId,
      net: toInt(row.cashOut) - toInt(row.buyIn),
    }))
    .sort((a, b) => b.net - a.net)
  return { ...session, rows, totals: sessionTotals(session) }
}

// Oldest → newest (for time-series charts).
export function sessionsChronological(data) {
  return [...data.sessions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
  )
}

// Total buy-in per session over time.
export function potOverTime(data) {
  return sessionsChronological(data).map((s) => ({
    id: s.id,
    date: s.date,
    buyIn: sessionTotals(s).buyIn,
    playerCount: s.players.length,
  }))
}

// Cumulative net for top N players across sessions.
export function cumulativeNetSeries(data, topN = 5) {
  const board = leaderboard(data).slice(0, topN)
  const topIds = new Set(board.map((p) => p.player.id))
  const cumulative = new Map(board.map((p) => [p.player.id, 0]))
  const labels = []
  const series = board.map((p) => ({
    id: p.player.id,
    name: p.player.name,
    data: [],
  }))

  for (const s of sessionsChronological(data)) {
    labels.push(s.date)
    for (const row of s.players ?? []) {
      if (topIds.has(row.playerId)) {
        cumulative.set(
          row.playerId,
          cumulative.get(row.playerId) + toInt(row.cashOut) - toInt(row.buyIn)
        )
      }
    }
    for (const ser of series) {
      ser.data.push(cumulative.get(ser.id))
    }
  }

  return { labels, series }
}

// All-time net per player (for bar chart).
export function playerNetChartData(data) {
  const board = leaderboard(data).filter((p) => p.sessions > 0)
  return {
    labels: board.map((p) => p.player.name),
    values: board.map((p) => p.net),
  }
}

// Win/loss session counts for top players (stacked bar).
export function sessionWinLossData(data, topN = 8) {
  const wins = new Map()
  const losses = new Map()
  for (const p of data.players) {
    wins.set(p.id, 0)
    losses.set(p.id, 0)
  }
  for (const s of data.sessions) {
    for (const row of s.players ?? []) {
      const net = toInt(row.cashOut) - toInt(row.buyIn)
      if (net > 0) wins.set(row.playerId, (wins.get(row.playerId) ?? 0) + 1)
      else if (net < 0) losses.set(row.playerId, (losses.get(row.playerId) ?? 0) + 1)
    }
  }
  const top = leaderboard(data).slice(0, topN)
  return {
    labels: top.map((p) => p.player.name),
    wins: top.map((p) => wins.get(p.player.id) ?? 0),
    losses: top.map((p) => losses.get(p.player.id) ?? 0),
  }
}

// Players who have at least one session.
export function playersWithSessions(data) {
  return playerStats(data).filter((p) => p.sessions > 0)
}

// Per-player session rows, oldest → newest.
export function playerSessions(data, playerId) {
  return sessionsChronological(data)
    .map((s) => {
      const row = (s.players ?? []).find((p) => p.playerId === playerId)
      if (!row) return null
      return {
        sessionId: s.id,
        date: s.date,
        buyIn: toInt(row.buyIn),
        cashOut: toInt(row.cashOut),
        net: toInt(row.cashOut) - toInt(row.buyIn),
      }
    })
    .filter(Boolean)
}

// Chart series for one player.
export function playerChartSeries(data, playerId) {
  const sessions = playerSessions(data, playerId)
  let cumulative = 0
  return {
    labels: sessions.map((s) => s.date),
    nets: sessions.map((s) => s.net),
    cumulative: sessions.map((s) => {
      cumulative += s.net
      return cumulative
    }),
    buyIns: sessions.map((s) => s.buyIn),
    cashOuts: sessions.map((s) => s.cashOut),
  }
}

// Full stats + session list for one player.
export function playerOneStats(data, playerId) {
  const sessions = playerSessions(data, playerId)
  let buyIn = 0
  let cashOut = 0
  let wins = 0
  let losses = 0
  let breaks = 0
  for (const s of sessions) {
    buyIn += s.buyIn
    cashOut += s.cashOut
    if (s.net > 0) wins++
    else if (s.net < 0) losses++
    else breaks++
  }
  const player = data.players.find((p) => p.id === playerId)
  return {
    player: player ?? { id: playerId, name: playerId },
    sessions: sessions.length,
    buyIn,
    cashOut,
    net: cashOut - buyIn,
    wins,
    losses,
    breaks,
    sessionList: [...sessions].reverse(),
  }
}

// Dashboard summary numbers.
export function summary(data) {
  let totalBuyIn = 0,
    totalCashOut = 0
  for (const s of data.sessions) {
    for (const row of s.players ?? []) {
      totalBuyIn += toInt(row.buyIn)
      totalCashOut += toInt(row.cashOut)
    }
  }
  const board = leaderboard(data)
  const top = board.find((p) => p.net !== 0) || null
  return {
    players: data.players.length,
    sessions: data.sessions.length,
    totalBuyIn,
    totalCashOut,
    top,
  }
}
