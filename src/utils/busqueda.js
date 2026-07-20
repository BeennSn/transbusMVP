// busqueda.js — Búsqueda de rutas tolerante a tildes y siglas de lugares
// (p.ej. "upao" encuentra rutas con "Universidad Privada Antenor Orrego" en sirveA)

import lugaresData from '@/data/lugares.json'

const LUGARES = lugaresData.lugares
const MIN_LARGO_ALIAS = 3 // evita que términos de 1-2 letras expandan a medio diccionario
const DIACRITICOS = /[̀-ͯ]/g // marcas de acento tras normalize('NFD')

/** Minúsculas + sin tildes/diacríticos, para comparar sin importar acentos. */
export function normalizarTexto(s) {
  return (s ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .trim()
}

/**
 * Nombres canónicos de lugares (universidades, mercados, malls) cuyo alias
 * coincide con el término buscado — p.ej. "upao" -> ["Universidad Privada Antenor Orrego"].
 * @param {string} query
 * @param {Array} lugares  Inyectable para tests
 * @returns {string[]}
 */
export function lugaresQueMatchean(query, lugares = LUGARES) {
  const q = normalizarTexto(query)
  if (q.length < MIN_LARGO_ALIAS) return []
  return lugares
    .filter((lugar) => lugar.alias.some((alias) => normalizarTexto(alias).includes(q)))
    .map((lugar) => lugar.nombre)
}

/**
 * true si una ruta coincide con el término de búsqueda: compara código,
 * nombre, operador y sirveA (sin tildes/mayúsculas), y además expande el
 * término si matchea el alias de un lugar conocido.
 * @param {{codigo?, nombre?, operador?, sirveA?: string[]}} ruta
 * @param {string} query
 */
export function rutaCoincideBusqueda(ruta, query) {
  const q = normalizarTexto(query)
  if (!q) return true

  const terminos = [q, ...lugaresQueMatchean(query).map(normalizarTexto)]
  const campos = [ruta.codigo, ruta.nombre, ruta.operador, ...(ruta.sirveA ?? [])]
    .filter(Boolean)
    .map(normalizarTexto)

  return terminos.some((termino) => campos.some((campo) => campo.includes(termino)))
}
