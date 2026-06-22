// Persian (Jalali) date + Toman currency formatting helpers.
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import { toAsciiDigits } from './digits'

// --- Currency (Toman) ---
// Integer-only, grouped with Persian digits + separators, no decimals.
export function toman(value) {
  const n = Number(value) || 0
  const rounded = Math.round(n)
  return rounded.toLocaleString('fa-IR') + ' تومان'
}

// Bare number, Persian digits + separators, no currency suffix.
export function tomanNum(value) {
  const n = Number(value) || 0
  return Math.round(n).toLocaleString('fa-IR')
}

// Format a signed profit/loss with Persian digits.
export function tomanSigned(value) {
  const n = Number(value) || 0
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return sign + Math.abs(Math.round(n)).toLocaleString('fa-IR') + ' تومان'
}

// --- Dates (Jalali / Shamsi) ---

// Input: ISO date string "YYYY-MM-DD" (Gregorian). Output: "۱۴۰۵/۰۴/۱۵".
export function jalaliShort(isoDate) {
  if (!isoDate) return ''
  const d = new DateObject({
    date: isoDate,
    format: 'YYYY/MM/DD',
    calendar: gregorian,
  }).convert(persian, persian_fa)
  return d.format('YYYY/MM/DD')
}

// Input: ISO date string. Output: "جمعه ۱۵ تیر ۱۴۰۵".
export function jalaliLong(isoDate) {
  if (!isoDate) return ''
  const d = new DateObject({
    date: isoDate,
    format: 'YYYY-MM-DD',
    calendar: gregorian,
  }).convert(persian, persian_fa)
  return d.format('dddd DD MMMM YYYY')
}

// Convert a Jalali DateObject to a Gregorian ISO date string "YYYY-MM-DD".
export function jalaliToIso(jalaliDateObject) {
  if (!jalaliDateObject) return ''
  const g = new DateObject(jalaliDateObject).convert(gregorian)
  return toAsciiDigits(g.format('YYYY-MM-DD'))
}

// Today's Gregorian ISO date, for defaulting new sessions.
export function todayIso() {
  const d = new DateObject({ calendar: gregorian })
  return toAsciiDigits(d.format('YYYY-MM-DD'))
}
