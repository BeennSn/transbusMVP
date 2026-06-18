import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import MarkerBus from './MarkerBus'

// Coordenadas del centro de Trujillo, Perú
const TRUJILLO_CENTER = [-8.1116, -79.0288]

/**
 * MapaLeaflet — Contenedor del mapa interactivo.
 * @param {{ posicionBus: [number,number]|null, rutaCodigo: string, rutaNombre: string }} props
 */
export default function MapaLeaflet({ posicionBus = null, rutaCodigo = 'B1', rutaNombre = '' }) {
  const tienePosicion = posicionBus && posicionBus.length === 2
  const centro = tienePosicion ? posicionBus : TRUJILLO_CENTER
  const zoom = tienePosicion ? 15 : 14

  return (
    <MapContainer
      center={centro}
      zoom={zoom}
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

      {tienePosicion ? (
        <MarkerBus
          position={posicionBus}
          label={`${rutaCodigo} · ${rutaNombre}`}
          rutaCodigo={rutaCodigo}
        />
      ) : (
        <MarkerBus
          position={TRUJILLO_CENTER}
          label="Sin reportes aún — el marcador aparece al reportar"
          rutaCodigo={rutaCodigo}
          invisible
        />
      )}
    </MapContainer>
  )
}
