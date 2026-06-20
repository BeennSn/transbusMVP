// geo.js — Utilidades de cálculo geoespacial compartidas
// Usadas por RecorridoMapa.jsx (trazado /rutas) y Mapa.jsx (trazado principal)

const R_KM = 6371 // radio de la Tierra en km

/**
 * Distancia Haversine entre dos puntos geográficos.
 * @param {[number, number]} punto1  [lat, lng]
 * @param {[number, number]} punto2  [lat, lng]
 * @returns {number} distancia en kilómetros
 */
export function calcularDistanciaEntreDosPuntos(punto1, punto2) {
  const [lat1, lon1] = punto1
  const [lat2, lon2] = punto2
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Suma de distancias Haversine a lo largo de un array de coordenadas [lat, lng].
 * @param {Array<[number, number]>} coordenadas
 * @returns {number} distancia total en km, redondeada a 1 decimal
 */
export function calcularDistanciaTotal(coordenadas) {
  let total = 0
  for (let i = 1; i < coordenadas.length; i++) {
    total += calcularDistanciaEntreDosPuntos(coordenadas[i - 1], coordenadas[i])
  }
  return parseFloat(total.toFixed(1))
}
