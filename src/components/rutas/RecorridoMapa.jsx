import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { calcularDistanciaTotal, normalizarCoordenada } from '@/utils/geo'

export default function RecorridoMapa({ sentido, ruta }) {
  // Validar datos
  if (!sentido) return <div>Error: Sin sentido</div>
  if (!sentido.coordenadas) return <div>Error: Sin coordenadas</div>
  if (sentido.coordenadas.length === 0) return <div>Error: Coordenadas vacías</div>

  const coordenadas = sentido.coordenadas.map(normalizarCoordenada)
  const centro = coordenadas[Math.floor(coordenadas.length / 2)]

  const COLORES = {
    B1: { linea: '#1d6fe8', puntos: '#1d4ed8', inicio: '#16a34a', fin: '#dc2626' },
    H: { linea: '#be185d', puntos: '#9d174d', inicio: '#16a34a', fin: '#dc2626' }
  }
  const colores = COLORES[ruta.codigo] || COLORES.B1

  const distancia = calcularDistanciaTotal(coordenadas)

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#e8f0fd',
        borderRadius: '8px 8px 0 0',
        borderBottom: `2px solid ${colores.linea}`
      }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
          {sentido.origen} → {sentido.destino}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          ({distancia} km)
        </p>
      </div>

      <MapContainer
        center={centro}
        zoom={13}
        style={{ width: '100%', height: '400px', borderRadius: '0 0 8px 8px' }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Polyline positions={coordenadas} color={colores.linea} weight={5} opacity={0.85} />

        {coordenadas.map((coord, idx) => {
          if (idx % 5 !== 0 && idx !== 0 && idx !== coordenadas.length - 1) return null
          return (
            <CircleMarker key={idx} center={coord} radius={6} fillColor={colores.puntos} fillOpacity={0.9} color="white" weight={2}>
              <Popup>Parada {idx + 1}</Popup>
            </CircleMarker>
          )
        })}

        <CircleMarker center={coordenadas[0]} radius={8} fillColor={colores.inicio} fillOpacity={0.95} color="white" weight={3}>
          <Popup><strong>INICIO</strong><br />{sentido.origen}</Popup>
        </CircleMarker>

        <CircleMarker center={coordenadas[coordenadas.length - 1]} radius={8} fillColor={colores.fin} fillOpacity={0.95} color="white" weight={3}>
          <Popup><strong>FIN</strong><br />{sentido.destino}</Popup>
        </CircleMarker>
      </MapContainer>

      <div style={{ padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '0 0 8px 8px', fontSize: '0.75rem', color: '#64748b' }}>
        🟢 Inicio | 🔵 Paradas | 🔴 Fin
      </div>
    </div>
  )
}
