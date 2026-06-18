import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import MarkerBus from './MarkerBus'

// Coordenadas del centro de Trujillo, Perú
const TRUJILLO_CENTER = [-8.1116, -79.0288]

// Posición simulada del bus (cerca del centro, en Av. España)
const BUS_MOCK_POSITION = [-8.1098, -79.0261]

/**
 * MapaLeaflet — Contenedor del mapa interactivo.
 * Tiles gratuitos de OpenStreetMap, sin API key.
 */
export default function MapaLeaflet() {
  return (
    <MapContainer
      center={TRUJILLO_CENTER}
      zoom={14}
      zoomControl={false}        // usamos ZoomControl con posición custom
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
      attributionControl={false} // ocultamos para móvil (poco espacio)
    >
      {/* Tiles de OpenStreetMap — gratuitos, sin API key */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      {/* Zoom buttons en la esquina superior derecha */}
      <ZoomControl position="topright" />

      {/* Bus simulado */}
      <MarkerBus
        position={BUS_MOCK_POSITION}
        label="B1 · Av. España con Jr. Orbegoso"
      />
    </MapContainer>
  )
}
