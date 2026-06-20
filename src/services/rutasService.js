// rutasService.js — Lee datos locales de rutas.json
// Preparado para migrar a Firestore en Fase 4 sin cambiar los llamadores.

import data from '@/data/rutas.json'
import { enrichRutasWithParadas } from '@/utils/rutasParser'

const { rutas } = data
const rutasEnriquecidas = enrichRutasWithParadas(rutas)

/**
 * Retorna todas las rutas disponibles con paradas enriquecidas.
 * @returns {Array}
 */
export const getRutas = () => rutasEnriquecidas

/**
 * Retorna una ruta por su ID con paradas enriquecidas.
 * @param {string} id  p.ej. "b1-nuevo-california"
 * @returns {Object|undefined}
 */
export const getRutaById = (id) => rutasEnriquecidas.find((r) => r.id === id)
