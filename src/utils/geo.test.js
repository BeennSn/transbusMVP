import { describe, it, expect } from 'vitest'
import { normalizarCoordenada, calcularDistanciaEntreDosPuntos, calcularDistanciaTotal } from './geo'

describe('normalizarCoordenada', () => {
  it('deja pasar un array [lat, lng] tal cual (formato GTFS/OMUS)', () => {
    expect(normalizarCoordenada([-8.11, -79.02])).toEqual([-8.11, -79.02])
  })

  it('convierte {latitude, longitude} a [lat, lng] (formato WikiRoutes)', () => {
    expect(normalizarCoordenada({ latitude: -8.11, longitude: -79.02 })).toEqual([-8.11, -79.02])
  })
})

describe('calcularDistanciaEntreDosPuntos', () => {
  it('devuelve 0 para el mismo punto', () => {
    expect(calcularDistanciaEntreDosPuntos([-8.11, -79.02], [-8.11, -79.02])).toBe(0)
  })

  it('calcula ~1 km entre dos puntos separados por 0.009° de latitud', () => {
    // 1° de latitud ≈ 111 km → 0.009° ≈ 1 km
    const d = calcularDistanciaEntreDosPuntos([-8.000, -79.000], [-8.009, -79.000])
    expect(d).toBeGreaterThan(0.9)
    expect(d).toBeLessThan(1.1)
  })
})

describe('calcularDistanciaTotal', () => {
  it('devuelve 0 para menos de 2 puntos', () => {
    expect(calcularDistanciaTotal([])).toBe(0)
    expect(calcularDistanciaTotal([[-8.11, -79.02]])).toBe(0)
  })

  it('suma las distancias tramo a tramo, redondeado a 1 decimal', () => {
    const coordenadas = [
      [-8.000, -79.000],
      [-8.009, -79.000], // ~1 km
      [-8.018, -79.000], // ~1 km más
    ]
    const total = calcularDistanciaTotal(coordenadas)
    expect(total).toBeGreaterThan(1.8)
    expect(total).toBeLessThan(2.2)
  })
})
