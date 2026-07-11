// importarGtfsOmus.js — Genera src/data/rutas.json desde el feed GTFS de Trujillo-OMUS
//
// Fuente: https://github.com/trufi-association/Trujillo-OMUS (GPL-3.0)
// Mantenido por Trufi Association + Municipalidad de Trujillo, datos derivados de OpenStreetMap.
//
// El feed no incluye tarifa ni frecuencia real (un solo trip sintético por ruta),
// así que esos campos quedan null con nota "Por confirmar" en vez de inventarlos.
//
// Las rutas "b1-nuevo-california" y "h-huanchaco" están curadas a mano (tarifa y
// horarios reales) y no forman parte de este feed — se preservan tal cual.
//
// Uso: node scripts/importarGtfsOmus.js

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GTFS_BASE = 'https://raw.githubusercontent.com/trufi-association/Trujillo-OMUS/master/GTFS-Peru-Trujillo/out/gtfs'
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'rutas.json')
const IDS_PRESERVADOS = ['b1-nuevo-california', 'h-huanchaco']

const PALETA = [
  '#7c3aed', '#0891b2', '#d97706', '#059669', '#dc2626', '#4338ca',
  '#be185d', '#0d9488', '#ca8a04', '#7e22ce', '#0369a1', '#b91c1c',
  '#15803d', '#c2410c', '#4f46e5', '#a21caf',
]

function slugify(s) {
  return s.toLowerCase().replace(/"/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// El feed no escapa comas embebidas entre comillas (las comillas que aparecen
// son literales, p.ej. `M-07 "V"`), así que un split simple por coma basta.
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const vals = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] ?? '' })
    return obj
  })
}

// Reduce la densidad de puntos de una polilínea manteniendo primer/último punto.
// Limita el tamaño del JSON final sin cambiar visiblemente el trazo a nivel de ciudad.
function simplificar(puntos, max = 150) {
  if (puntos.length <= max) return puntos
  const paso = puntos.length / max
  const out = []
  for (let i = 0; i < max; i++) out.push(puntos[Math.floor(i * paso)])
  out.push(puntos[puntos.length - 1])
  return out
}

function muestrear(arr, n) {
  if (arr.length <= n) return arr
  const paso = (arr.length - 1) / (n - 1)
  return Array.from({ length: n }, (_, i) => arr[Math.round(i * paso)])
}

async function fetchText(file) {
  const res = await fetch(`${GTFS_BASE}/${file}`)
  if (!res.ok) throw new Error(`No se pudo descargar ${file}: ${res.status}`)
  return res.text()
}

async function main() {
  console.log('Descargando GTFS de Trujillo-OMUS...')
  const [agencyTxt, routesTxt, tripsTxt, stopsTxt, stopTimesTxt, shapesTxt] = await Promise.all(
    ['agency.txt', 'routes.txt', 'trips.txt', 'stops.txt', 'stop_times.txt', 'shapes.txt'].map(fetchText)
  )

  const agencies = new Map(parseCSV(agencyTxt).map((a) => [a.agency_id, a.agency_name]))
  const routes = parseCSV(routesTxt)
  const trips = parseCSV(tripsTxt)
  const stops = new Map(parseCSV(stopsTxt).map((s) => [s.stop_id, s]))
  const tripByRoute = new Map(trips.map((t) => [t.route_id, t]))

  const stopTimesByTrip = new Map()
  for (const row of parseCSV(stopTimesTxt)) {
    if (!stopTimesByTrip.has(row.trip_id)) stopTimesByTrip.set(row.trip_id, [])
    stopTimesByTrip.get(row.trip_id).push(row)
  }
  for (const arr of stopTimesByTrip.values()) arr.sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence))

  const shapePointsById = new Map()
  for (const row of parseCSV(shapesTxt)) {
    if (!shapePointsById.has(row.shape_id)) shapePointsById.set(row.shape_id, [])
    shapePointsById.get(row.shape_id).push(row)
  }
  for (const arr of shapePointsById.values()) arr.sort((a, b) => Number(a.shape_pt_sequence) - Number(b.shape_pt_sequence))

  // Agrupar por código de ruta: algunas líneas tienen 2 route_id (ida y vuelta)
  const grupos = new Map()
  for (const r of routes) {
    const slug = slugify(r.route_short_name)
    if (!grupos.has(slug)) grupos.set(slug, [])
    grupos.get(slug).push(r)
  }

  const rutasGeneradas = []
  let colorIdx = 0

  for (const [slug, rutasDelGrupo] of grupos) {
    const primera = rutasDelGrupo[0]
    const operador = agencies.get(primera.agency_id) ?? 'Operador no identificado'
    const codigo = primera.route_short_name
    const color = PALETA[colorIdx++ % PALETA.length]

    const sentidos = rutasDelGrupo.map((r, idx) => {
      const trip = tripByRoute.get(r.route_id)
      const stopTimes = trip ? (stopTimesByTrip.get(trip.trip_id) ?? []) : []
      const nombresParadas = stopTimes.map((st) => stops.get(st.stop_id)?.stop_name).filter(Boolean)

      const shapeId = trip?.shape_id ?? r.route_id
      const shapePts = (shapePointsById.get(shapeId) ?? [])
        .map((p) => [Number(p.shape_pt_lat), Number(p.shape_pt_lon)])
      const coordenadas = simplificar(shapePts, 150)

      const partes = r.route_long_name.split(':').slice(1).join(':').split('→').map((s) => s.trim())
      const destinoTexto = partes[1] ?? partes[0] ?? r.route_long_name

      const nombreSentido = rutasDelGrupo.length > 1
        ? (idx === 0 ? `Ida — ${destinoTexto}` : `Vuelta — ${destinoTexto}`)
        : 'Recorrido completo'

      return {
        id: `${slug}-${idx + 1}`,
        nombre: nombreSentido,
        orden: idx + 1,
        origen: nombresParadas[0] ?? r.route_long_name,
        destino: nombresParadas[nombresParadas.length - 1] ?? destinoTexto,
        recorrido: nombresParadas.join(' - '),
        coordenadas,
        _totalParadasReal: nombresParadas.length,
        _stopTimes: stopTimes,
      }
    })

    const sentidoPrincipal = sentidos[0]
    const totalParadas = sentidos.reduce((max, s) => Math.max(max, s._totalParadasReal), 0)

    const paraderosDestacados = muestrear(sentidoPrincipal._stopTimes, 7).map((st, i) => {
      const stop = stops.get(st.stop_id)
      return {
        orden: i + 1,
        nombre: stop?.stop_name ?? 'Parada sin nombre',
        lat: Number(stop?.stop_lat),
        lng: Number(stop?.stop_lon),
      }
    })

    rutasGeneradas.push({
      id: slug,
      codigo,
      nombre: `${codigo} - ${operador}`,
      operador,
      tipo: 'Micro',
      pasaje: null,
      pasajeNota: 'Por confirmar',
      duracionMin: null,
      frecuenciaMin: null,
      color,
      sentido: rutasDelGrupo.length > 1 ? 'ida-vuelta' : 'circular',
      origen: sentidoPrincipal.origen,
      destino: sentidoPrincipal.destino,
      totalParadas,
      sentidos: sentidos.map(({ _totalParadasReal, _stopTimes, ...s }) => s),
      paraderosDestacados,
      nota: 'Generado automáticamente desde el GTFS de Trujillo-OMUS (Trufi Association / Municipalidad de Trujillo, datos OpenStreetMap). Tarifa y frecuencia no están en la fuente y requieren verificación manual.',
    })
  }

  const actual = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'))
  const preservadas = actual.rutas.filter((r) => IDS_PRESERVADOS.includes(r.id))

  const salida = { rutas: [...preservadas, ...rutasGeneradas] }
  fs.writeFileSync(OUT_PATH, JSON.stringify(salida, null, 2))

  console.log(`Listo: ${preservadas.length} rutas preservadas + ${rutasGeneradas.length} generadas desde GTFS = ${salida.rutas.length} rutas totales.`)
  console.log(`Tamaño del archivo: ${(fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2)} MB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
