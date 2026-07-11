import { describe, it, expect } from 'vitest'
import { formatTiempoRelativo } from './tiempo'

const AHORA = new Date('2026-07-11T12:00:00Z').getTime()

describe('formatTiempoRelativo', () => {
  it('devuelve null sin timestamp', () => {
    expect(formatTiempoRelativo(null, AHORA)).toBeNull()
    expect(formatTiempoRelativo(undefined, AHORA)).toBeNull()
  })

  it('"justo ahora" para menos de 1 minuto', () => {
    const hace30s = AHORA - 30_000
    expect(formatTiempoRelativo(hace30s, AHORA)).toBe('justo ahora')
  })

  it('singular para exactamente 1 minuto', () => {
    const hace1min = AHORA - 60_000
    expect(formatTiempoRelativo(hace1min, AHORA)).toBe('hace 1 min')
  })

  it('plural para varios minutos', () => {
    const hace5min = AHORA - 5 * 60_000
    expect(formatTiempoRelativo(hace5min, AHORA)).toBe('hace 5 min')
  })

  it('acepta un Firestore Timestamp (objeto con toMillis())', () => {
    const fakeTimestamp = { toMillis: () => AHORA - 3 * 60_000 }
    expect(formatTiempoRelativo(fakeTimestamp, AHORA)).toBe('hace 3 min')
  })

  it('acepta un objeto Date', () => {
    const fecha = new Date(AHORA - 2 * 60_000)
    expect(formatTiempoRelativo(fecha, AHORA)).toBe('hace 2 min')
  })
})
