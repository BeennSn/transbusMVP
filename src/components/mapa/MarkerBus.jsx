import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

/**
 * Genera el HTML del ícono de bus como string puro.
 */
function crearIconoBus(color = '#1d6fe8') {
  const busSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 17l0 3"/>
      <path d="M6 5c7.667 -.333 12 .889 12 4l0 8c0 2 -1 3 -3 4l-6 0c-2 0 -3 -1 -3 -4l0 -8c0 -2.667 4 -4.333 12 -4"/>
      <path d="M6 8l12 0"/>
      <path d="M6 12l12 0"/>
      <path d="M9 17l0 3"/>
      <path d="M18 17l0 3"/>
    </svg>
  `

  const html = `
    <div class="bus-marker-wrapper">
      <div class="bus-marker-pulse" style="background: ${color}40"></div>
      <div class="bus-marker-icon" style="background: ${color}">${busSvg}</div>
    </div>
  `

  return divIcon({
    html,
    className:   '',
    iconSize:    [44, 44],
    iconAnchor:  [22, 22],
    popupAnchor: [0, -24],
  })
}

const COLORES_RUTA = { B1: '#1d6fe8', H: '#be185d' }

/**
 * MarkerBus — marcador de bus con pulso animado.
 * @param {{ position: [number, number], label?: string, rutaCodigo?: string, rutaColor?: string, invisible?: boolean }} props
 */
export default function MarkerBus({ position, label = '', rutaCodigo = 'B1', rutaColor, invisible = false }) {
  // rutaColor (prop directa) > mapa fijo por código > azul por defecto
  const color = rutaColor ?? COLORES_RUTA[rutaCodigo] ?? '#1d6fe8'
  const icono = crearIconoBus(color)

  if (invisible) return null

  return (
    <Marker position={position} icon={icono}>
      <Popup closeButton={false} offset={[0, -10]}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize:   '0.8125rem',
          color:      '#0f172a',
          whiteSpace: 'nowrap',
          padding:    '2px 0',
        }}>
          🚌 {label || `Ruta ${rutaCodigo}`}
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize:   '0.75rem',
          color,
          fontWeight: 500,
          marginTop:  '2px',
        }}>
          Reportado en vivo · En servicio
        </div>
      </Popup>
    </Marker>
  )
}
