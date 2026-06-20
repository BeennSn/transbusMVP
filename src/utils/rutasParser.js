/**
 * Convierte el string de recorrido en array de paradas
 * @param {string} recorrido - String del recorrido separado por " - "
 * @returns {Array} Array de paradas con orden, nombre y tiempo estimado
 */
export const parseRecorridoToParadas = (recorrido) => {
  if (!recorrido) return []
  
  // Dividir por " - " y limpiar
  const avenidas = recorrido.split(' - ').map(av => av.trim()).filter(Boolean)
  
  // Generar paradas con tiempo estimado (~1.5 min por parada)
  return avenidas.map((nombre, idx) => ({
    orden: idx + 1,
    nombre,
    minutosDesdeInicio: Math.round(idx * 1.5)
  }))
}

/**
 * Enriquece los datos de rutas agregando paradas a cada sentido
 * @param {Array} rutas - Array de rutas desde rutas.json
 * @returns {Array} Rutas con paradas generadas automáticamente
 */
export const enrichRutasWithParadas = (rutas) => {
  return rutas.map(ruta => ({
    ...ruta,
    sentidos: ruta.sentidos?.map(sentido => ({
      ...sentido,
      paradas: parseRecorridoToParadas(sentido.recorrido)
    })) || []
  }))
}
