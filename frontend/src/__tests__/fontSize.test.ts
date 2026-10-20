/**
 * @jest-environment node
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

// Accessibility (usability feedback, participant P5): readable text must be at least 14 px
// (Tailwind `text-sm` or `text-[14px]`). This scans every .tsx under src/ (tests excluded)
// and fails on `text-xs` (12 px) or an arbitrary size below 14 px.
const MIN_PX = 14
const SRC = join(__dirname, '..')

// Explicit, justified exceptions: { file (relative to src, posix), line (substring), reason }.
// Purely decorative text and badge superscripts may stay small; today none is needed:
// the cart counter in the navbar carries information, so it was raised to 14 px instead.
const EXCEPTIONS: { file: string; line: string; reason: string }[] = []

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : tsxFiles(path)
    return name.endsWith('.tsx') && !name.endsWith('.test.tsx') ? [path] : []
  })
}

// Matches the size utility with any variant prefix: text-xs, sm:text-[10px], text-[0.75rem].
const SIZE = /(?<![\w-])text-(xs|\[(\d+(?:\.\d+)?)(px|rem|em)\])(?![\w-])/g

function smallSizes(source: string): string[] {
  const found: string[] = []
  for (const m of source.matchAll(SIZE)) {
    if (m[1] === 'xs') { found.push(m[0]); continue }
    const value = Number(m[2])
    const px = m[3] === 'px' ? value : value * 16
    if (px < MIN_PX) found.push(m[0])
  }
  return found
}

describe('readable text size (>= 14 px)', () => {
  it('detects text-xs and arbitrary sizes below 14 px, and accepts 14 px or more', () => {
    expect(smallSizes('class="text-xs"')).toEqual(['text-xs'])
    expect(smallSizes('class="text-[9px] sm:text-xs"')).toEqual(['text-[9px]', 'text-xs'])
    expect(smallSizes('class="text-[0.75rem]"')).toEqual(['text-[0.75rem]'])
    expect(smallSizes('class="text-[13px]"')).toEqual(['text-[13px]'])
    expect(smallSizes('class="text-sm text-[14px] text-[1rem] text-base text-xl text-[#fff] text-white/60"')).toEqual([])
  })

  it('finds source files to scan', () => {
    expect(tsxFiles(SRC).length).toBeGreaterThan(20)
  })

  it('no .tsx under src/ uses text smaller than 14 px', () => {
    const offenders: string[] = []
    for (const file of tsxFiles(SRC)) {
      const rel = relative(SRC, file).split(sep).join('/')
      readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
        if (smallSizes(line).length === 0) return
        if (EXCEPTIONS.some(e => e.file === rel && line.includes(e.line))) return
        offenders.push(`${rel}:${i + 1}  ${line.trim().slice(0, 110)}`)
      })
    }
    expect(offenders).toEqual([])
  })
})
