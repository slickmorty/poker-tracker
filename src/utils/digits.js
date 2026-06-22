// Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII 0-9.
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC = '٠١٢٣٤٥٦٧٨٩'

export function toAsciiDigits(s) {
  let out = ''
  for (const ch of String(s)) {
    const pi = PERSIAN.indexOf(ch)
    if (pi >= 0) {
      out += pi
      continue
    }
    const ai = ARABIC.indexOf(ch)
    if (ai >= 0) {
      out += ai
      continue
    }
    out += ch
  }
  return out
}
