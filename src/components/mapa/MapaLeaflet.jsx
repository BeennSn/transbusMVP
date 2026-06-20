import { useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import MarkerBus from './MarkerBus'

const TRUJILLO_CENTER = [-8.1116, -79.0288]

/* ─────────────────────────────────────────────────────────
   MapController — componente hijo que usa useMap() para
   llamar fitBounds de forma reactiva sin re-montar el mapa.
   Solo reajusta cuando:
   1. La clave del sentido cambia (cambio de ruta o sentido)
   2. La ubicación del usuario aparece por primera vez
───────────────────────────────────────────────────────── */
function MapController({ coordenadasRuta, ubicacionUsuario, sentidoKey }) {
  const map          = useMap()
  const prevKey      = useRef(null)
  const hadUbicacion = useRef(false)

  useEffect(() => {
    const rutaCambia    = sentidoKey !== prevKey.current
    const ubicacionNueva = ubicacionUsuario && !hadUbicacion.current

    // Solo reajusta cuando algo relevante cambia
    if (!rutaCambia && !ubicacionNueva) return

    prevKey.current = sentidoKey
    if (ubicacionUsuario) hadUbicacion.current = true

    // Construye los puntos para el bounds
    const puntos = []
    if (coordenadasRuta?.length > 0) puntos.push(...coordenadasRuta)
    if (ubicacionUsuario)             puntos.push(ubicacionUsuario)

    if (puntos.length === 0) return

    try {
      const bounds = L.latLngBounds(puntos)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    } catch (e) {
      // bounds inválido (e.g. un solo punto) → no hace nada
    }
  }, [sentidoKey, ubicacionUsuario, coordenadasRuta, map])

  return null
}

/* ─────────────────────────────────────────────────────────
   MapaLeaflet
───────────────────────────────────────────────────────── */
/**
 * @param {{
 *   posicionBus?:      [number, number] | null,
 *   rutaCodigo?:       string,
 *   rutaNombre?:       string,
 *   ubicacionUsuario?: [number, number] | null,
 *   coordenadasRuta?:  Array<[number, number]> | null,
 *   colorRuta?:        string,
 *   sentidoKey?:       string | number,
 * }} props
 */
export default function MapaLeaflet({
  posicionBus     = null,
  rutaCodigo      = 'B1',
  rutaNombre      = '',
  ubicacionUsuario = null,
  coordenadasRuta  = null,
  colorRuta        = '#1d6fe8',
  sentidoKey       = 'default',
}) {
  const tieneBus    = posicionBus && posicionBus.length === 2
  const tieneRuta   = coordenadasRuta && coordenadasRuta.length > 1

  // Centro inicial: si hay ruta, usamos el punto medio; si no, Trujillo
  const centroInicial = tieneRuta
    ? coordenadasRuta[Math.floor(coordenadasRuta.length / 2)]
    : (tieneBus ? posicionBus : TRUJILLO_CENTER)
  const zoomInicial = tieneRuta ? 13 : (tieneBus ? 15 : 14)

  return (
    <MapContainer
      center={centroInicial}
      zoom={zoomInicial}
      zoomControl={false}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      <ZoomControl position="topright" />

      {/* ── Polyline del sentido seleccionado ─────────────── */}
      {tieneRuta && (
        <Polyline
          positions={coordenadasRuta}
          color={colorRuta}
          weight={5}
          opacity={0.85}
          smoothFactor={2}   // reduce vértices al hacer zoom-out → mejor perf
        />
      )}

      {/* ── Marcador del bus (mock) ────────────────────────── */}
      <MarkerBus
        position={tieneBus ? posicionBus : TRUJILLO_CENTER}
        label={tieneBus ? `${rutaCodigo} · ${rutaNombre}` : 'Bus en servicio'}
        rutaCodigo={rutaCodigo}
      />

      {/* ── Marcador "Tú estás aquí" ──────────────────────── */}
      {ubicacionUsuario && (
        <>
          {/* Halo exterior semitransparente */}
          <CircleMarker
            center={ubicacionUsuario}
            radius={20}
            pathOptions={{
              fillColor:   '#3b82f6',
              fillOpacity: 0.18,
              color:       '#3b82f6',
              weight:      1,
              opacity:     0.35,
            }}
          />
          {/* Punto interior sólido */}
          <CircleMarker
            center={ubicacionUsuario}
            radius={8}
            pathOptions={{
              fillColor:   '#2563eb',
              fillOpacity: 1,
              color:       '#ffffff',
              weight:      2.5,
              opacity:     1,
            }}
          />
        </>
      )}

      {/* ── Ajuste dinámico de bounds ─────────────────────── */}
      <MapController
        coordenadasRuta={coordenadasRuta}
        ubicacionUsuario={ubicacionUsuario}
        sentidoKey={sentidoKey}
      />
    </MapContainer>
  )
}
