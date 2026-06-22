// Number input that shows grouped Persian digits as the user types,
// while storing a plain integer value (Toman, no decimals).
//
// Key correctness points:
//  - Persian (۰-۹) and Arabic-Indic (٠-٩) digits are normalized to ASCII
//    before parsing, because JS \d only matches ASCII 0-9. Without this,
//    the formatted Persian digits get stripped on the next keystroke and
//    the field appears to reject input.
//  - The caret position is restored after re-formatting so mid-string
//    edits (not just appending at the end) work as expected.
//
// Props: value (number), onChange(number), placeholder, autoFocus, aria-label, suggestions (number[])
import { useRef, useState } from 'react'
import { toAsciiDigits } from '../../utils/digits'

function groupFa(n) {
  if (n === '' || n === null || n === undefined) return ''
  return Number(n).toLocaleString('fa-IR')
}

export default function TomanInput({
  value,
  onChange,
  placeholder = 'مبلغ',
  autoFocus = false,
  'aria-label': ariaLabel,
  suggestions = [],
}) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)

  function handleChange(e) {
    const el = e.target
    const raw = el.value

    // Normalize any digit to ASCII, then keep only digits.
    const digits = toAsciiDigits(raw).replace(/\D/g, '')
    const n = digits ? parseInt(digits, 10) : 0

    // Compute how the displayed (grouped, Persian) string will look, and
    // keep the caret just after the same logical digit the user edited.
    const caret = el.selectionStart ?? raw.length
    const digitsBeforeCaret = toAsciiDigits(raw.slice(0, caret)).replace(/\D/g, '').length

    onChange(n)

    // After React re-renders with the grouped string, restore caret.
    requestAnimationFrame(() => {
      const node = ref.current
      if (!node) return
      const grouped = groupFa(n)
      // Walk the grouped string up to digitsBeforeCaret digits and place
      // the caret right after them.
      let digitCount = 0
      let i = 0
      for (; i < grouped.length && digitCount < digitsBeforeCaret; i++) {
        if (PERSIAN.indexOf(grouped[i]) >= 0) digitCount++
      }
      node.setSelectionRange(i, i)
    })
  }

  function pickSuggestion(n) {
    onChange(n)
    setOpen(false)
    requestAnimationFrame(() => ref.current?.focus())
  }

  return (
    <div className="toman-input">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        dir="ltr"
        className="input toman-field"
        value={groupFa(value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-expanded={suggestions.length > 0 ? open : undefined}
        aria-haspopup={suggestions.length > 0 ? 'listbox' : undefined}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {suggestions.length > 0 && open && (
        <ul className="toman-suggestions" role="listbox" aria-label={ariaLabel}>
          {suggestions.map((n) => (
            <li key={n}>
              <button
                type="button"
                role="option"
                aria-selected={value === n}
                className={value === n ? 'active' : ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSuggestion(n)}
              >
                {groupFa(n)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
