// @vitest-environment jsdom
// (Mapa.jsx importa react-leaflet, que toca `window` al cargar el módulo)
import { describe, it, expect } from 'vitest'
import { getTierConfianza } from './Mapa'

describe('getTierConfianza', () => {
  it('0 reportes → sin reportes recientes', () => {
    expect(getTierConfianza(0).label).toBe('Sin reportes recientes')
  })

  it('1 reporte → estimación inicial', () => {
    expect(getTierConfianza(1).label).toBe('Estimación inicial')
  })

  it('2-3 reportes → estimación moderada', () => {
    expect(getTierConfianza(2).label).toBe('Estimación moderada')
    expect(getTierConfianza(3).label).toBe('Estimación moderada')
  })

  it('4+ reportes → alta confianza', () => {
    expect(getTierConfianza(4).label).toBe('Estimación de alta confianza')
    expect(getTierConfianza(100).label).toBe('Estimación de alta confianza')
  })
})
