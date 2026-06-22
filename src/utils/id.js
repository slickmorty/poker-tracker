// ID generation — short, human-readable, editable. No UUIDs.

// Make a slug from a name: lowercase, ASCII-ish, non-alphanumeric -> '-'.
export function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // keep Persian letters too
    .replace(/^-+|-+$/g, '')
}

// Next session id: ISO date + random suffix (never bare date — supports multiple sessions per day).
export function nextSessionId(date, existingIds) {
  const used = new Set(existingIds)
  let id
  do {
    id = `${date}-${sessionRandomSuffix()}`
  } while (used.has(id))
  return id
}

function sessionRandomSuffix() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

// Unique player id from a desired slug, appending "-2", "-3" on collisions.
export function uniquePlayerId(desired, existingIds) {
  const base = desired || 'player'
  if (!existingIds.includes(base)) return base
  let n = 2
  while (existingIds.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}
