import { describe, it, expect } from 'vitest'
import { normalizarTexto, lugaresQueMatchean, rutaCoincideBusqueda } from './busqueda'

describe('normalizarTexto', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizarTexto('César Vallejo')).toBe('cesar vallejo')
  })

  it('también simplifica la ñ a n (NFD la descompone en n + tilde)', () => {
    expect(normalizarTexto('ÑOÑO')).toBe('nono')
  })

  it('maneja null/undefined sin explotar', () => {
    expect(normalizarTexto(null)).toBe('')
    expect(normalizarTexto(undefined)).toBe('')
  })
})

describe('lugaresQueMatchean', () => {
  const lugares = [
    { id: 'upao', nombre: 'Universidad Privada Antenor Orrego', alias: ['upao', 'antenor orrego'] },
    { id: 'unt',  nombre: 'Universidad Nacional de Trujillo',    alias: ['unt', 'nacional de trujillo'] },
  ]

  it('encuentra el lugar por sigla exacta', () => {
    expect(lugaresQueMatchean('upao', lugares)).toEqual(['Universidad Privada Antenor Orrego'])
  })

  it('es insensible a mayúsculas y tildes en el query', () => {
    expect(lugaresQueMatchean('UPAO', lugares)).toEqual(['Universidad Privada Antenor Orrego'])
  })

  it('no expande queries muy cortos (< 3 caracteres)', () => {
    expect(lugaresQueMatchean('un', lugares)).toEqual([])
  })

  it('devuelve [] si no matchea ningún alias', () => {
    expect(lugaresQueMatchean('xyz123', lugares)).toEqual([])
  })
})

describe('rutaCoincideBusqueda', () => {
  const ruta = {
    codigo: 'M-07 "V"',
    nombre: 'M-07 "V" - Nuevo California',
    operador: 'Nuevo California',
    sirveA: ['Universidad Privada Antenor Orrego', 'Mercado La Hermelinda'],
  }

  it('query vacío matchea cualquier ruta', () => {
    expect(rutaCoincideBusqueda(ruta, '')).toBe(true)
    expect(rutaCoincideBusqueda(ruta, '   ')).toBe(true)
  })

  it('matchea por código', () => {
    expect(rutaCoincideBusqueda(ruta, 'm-07')).toBe(true)
  })

  it('matchea por sigla de universidad vía sirveA (el caso "upao")', () => {
    expect(rutaCoincideBusqueda(ruta, 'upao')).toBe(true)
  })

  it('matchea por alias de mercado ("hermelinda")', () => {
    expect(rutaCoincideBusqueda(ruta, 'hermelinda')).toBe(true)
  })

  it('no matchea una sigla de un lugar que la ruta no sirve', () => {
    expect(rutaCoincideBusqueda(ruta, 'ucv')).toBe(false)
  })

  it('no matchea texto irrelevante', () => {
    expect(rutaCoincideBusqueda(ruta, 'xyz123')).toBe(false)
  })
})
