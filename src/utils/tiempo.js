// tiempo.js — Formateo de tiempo relativo ("hace X min") para reportes en vivo

/**
 * Formatea un timestamp (Firestore Timestamp, number en ms, o Date) como
 * tiempo relativo en español. Devuelve null si no hay timestamp.
 * @param {{toMillis?: () => number}|number|Date|null|undefined} timestamp
 * @param {number} ahoraMs  Instante de referencia (inyectable para tests)
 * @returns {string|null}
 */
export function formatTiempoRelativo(timestamp, ahoraMs = Date.now()) {
  if (!timestamp) return null
  const ms = typeof timestamp?.toMillis === 'function'
    ? timestamp.toMillis()
    : (timestamp instanceof Date ? timestamp.getTime() : timestamp)
  if (typeof ms !== 'number' || Number.isNaN(ms)) return null

  const diffMin = Math.floor((ahoraMs - ms) / 60000)
  if (diffMin < 1) return 'justo ahora'
  if (diffMin === 1) return 'hace 1 min'
  return `hace ${diffMin} min`
}
