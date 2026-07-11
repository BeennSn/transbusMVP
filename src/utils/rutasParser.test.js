import { describe, it, expect } from 'vitest'
import { parseRecorridoToParadas, enrichRutasWithParadas } from './rutasParser'

describe('parseRecorridoToParadas', () => {
  it('devuelve [] para recorrido vacío o nulo', () => {
    expect(parseRecorridoToParadas('')).toEqual([])
    expect(parseRecorridoToParadas(null)).toEqual([])
    expect(parseRecorridoToParadas(undefined)).toEqual([])
  })

  it('separa por " - " y numera las paradas desde 1', () => {
    const paradas = parseRecorridoToParadas('Avenida El Sol - Jirón Los Jazmines - Avenida Alan García')
    expect(paradas).toHaveLength(3)
    expect(paradas[0]).toEqual({ orden: 1, nombre: 'Avenida El Sol', minutosDesdeInicio: 0 })
    expect(paradas[1].nombre).toBe('Jirón Los Jazmines')
    expect(paradas[2].orden).toBe(3)
  })

  it('asigna ~1.5 min por parada, redondeado', () => {
    const paradas = parseRecorridoToParadas('A - B - C - D')
    expect(paradas.map((p) => p.minutosDesdeInicio)).toEqual([0, 2, 3, 5])
  })

  it('descarta tramos vacíos (guiones dobles / espacios extra)', () => {
    const paradas = parseRecorridoToParadas('A -  - B')
    expect(paradas.map((p) => p.nombre)).toEqual(['A', 'B'])
  })
})

describe('enrichRutasWithParadas', () => {
  it('agrega paradas[] a cada sentido a partir de su recorrido', () => {
    const rutas = [
      { id: 'x', sentidos: [{ id: 1, recorrido: 'A - B' }] },
    ]
    const [enriquecida] = enrichRutasWithParadas(rutas)
    expect(enriquecida.sentidos[0].paradas).toHaveLength(2)
    expect(enriquecida.sentidos[0].paradas[0].nombre).toBe('A')
  })

  it('no muta el objeto original', () => {
    const original = { id: 'x', sentidos: [{ id: 1, recorrido: 'A - B' }] }
    enrichRutasWithParadas([original])
    expect(original.sentidos[0].paradas).toBeUndefined()
  })

  it('devuelve sentidos: [] si la ruta no trae sentidos', () => {
    const [enriquecida] = enrichRutasWithParadas([{ id: 'x' }])
    expect(enriquecida.sentidos).toEqual([])
  })
})
