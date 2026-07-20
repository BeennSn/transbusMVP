// asignarLugaresARutas.js — Llena ruta.sirveA revisando qué rutas pasan cerca
// de cada lugar conocido (universidades, mercados, malls) en data/lugares.json.
//
// Para cada ruta, revisa el trazado (coordenadas) de cada sentido y calcula
// la distancia mínima a cada lugar con Haversine. Si pasa a menos de
// RADIO_KM, ese lugar entra a sirveA. Reemplaza sirveA por completo en cada
// corrida (idempotente — no acumula duplicados si se re-ejecuta).
//
// Uso: node scripts/asignarLugaresARutas.js

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { calcularDistanciaEntreDosPuntos, normalizarCoordenada } from '../src/utils/geo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RUTAS_PATH = path.join(__dirname, '..', 'src', 'data', 'rutas.json')
const LUGARES_PATH = path.join(__dirname, '..', 'src', 'data', 'lugares.json')
const RADIO_KM = 0.4 // ~400m: distancia caminable desde una parada hasta la puerta del lugar

function distanciaMinimaARuta(ruta, lugar) {
  let minKm = Infinity
  for (const sentido of ruta.sentidos ?? []) {
    for (const punto of sentido.coordenadas ?? []) {
      const [lat, lng] = normalizarCoordenada(punto)
      const d = calcularDistanciaEntreDosPuntos([lat, lng], [lugar.lat, lugar.lng])
      if (d < minKm) minKm = d
    }
  }
  return minKm
}

function main() {
  const data = JSON.parse(fs.readFileSync(RUTAS_PATH, 'utf8'))
  const lugares = JSON.parse(fs.readFileSync(LUGARES_PATH, 'utf8')).lugares

  let rutasConLugares = 0
  for (const ruta of data.rutas) {
    const sirveA = lugares
      .filter((lugar) => distanciaMinimaARuta(ruta, lugar) <= RADIO_KM)
      .map((lugar) => lugar.nombre)

    if (sirveA.length > 0) {
      ruta.sirveA = sirveA
      rutasConLugares++
    } else {
      delete ruta.sirveA
    }
  }

  fs.writeFileSync(RUTAS_PATH, JSON.stringify(data, null, 2))
  console.log(`Listo: ${rutasConLugares} de ${data.rutas.length} rutas quedaron con sirveA (radio ${RADIO_KM * 1000}m).`)
}

main()
