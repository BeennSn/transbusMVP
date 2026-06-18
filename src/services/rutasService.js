// rutasService.js — Lee datos locales de rutas.json
// Preparado para migrar a Firestore en Fase 4 sin cambiar los llamadores.

import data from '@/data/rutas.json'

const { rutas } = data

/**
 * Retorna todas las rutas disponibles.
 * @returns {Array}
 */
export const getRutas = () => rutas

/**
 * Retorna una ruta por su ID.
 * @param {string} id  p.ej. "b1-nuevo-california"
 * @returns {Object|undefined}
 */
export const getRutaById = (id) => rutas.find((r) => r.id === id)
