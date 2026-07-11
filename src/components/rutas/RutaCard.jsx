import { useState } from 'react'
import {
  IconBus,
  IconClock,
  IconMapPin,
  IconCoin,
  IconChevronDown,
  IconChevronUp,
  IconArrowsLeftRight,
  IconRefresh,
  IconCircleFilled,
} from '@tabler/icons-react'
import ParadasModal from './ParadasModal'

/* ── Paleta de colores por código de ruta (rutas wikiroutes) ─ */
const RUTA_COLORS = {
  B1: { bg: '#e8f0fd', text: '#1d6fe8', dot: '#1d6fe8' },
  H:  { bg: '#fce7f3', text: '#be185d', dot: '#be185d' },
}

/**
 * Resuelve la paleta de colores de una ruta.
 * Prioridad: colores fijos por código > ruta.color (GTFS) > default gris.
 */
function getColores(ruta) {
  if (RUTA_COLORS[ruta.codigo]) return RUTA_COLORS[ruta.codigo]
  if (ruta.color) {
    return { bg: ruta.color + '22', text: ruta.color, dot: ruta.color }
  }
  return { bg: '#f1f5f9', text: '#475569', dot: '#475569' }
}

/* ── Chip pequeño reutilizable ────────────────────────── */
function Chip({ icon: Icon, children, color = '#64748b', bg = '#f1f5f9' }) {
  return (
    <span style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:         4,
      background:  bg,
      color,
      borderRadius: 999,
      padding:     '4px 10px',
      fontSize:    '0.75rem',
      fontWeight:  600,
      whiteSpace:  'nowrap',
    }}>
      <Icon size={12} stroke={2.2} />
      {children}
    </span>
  )
}

/* ── Timeline de paradas ──────────────────────────────── */
function TimelineParadas({ paradas, color }) {
  return (
    <div style={{ padding: '4px 0 0' }}>
      {paradas.map((p, i) => {
        const esUltimo = i === paradas.length - 1
        return (
          <div key={p.orden} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Línea + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i === 0 || esUltimo ? color : '#cbd5e1',
                border: `2px solid ${i === 0 || esUltimo ? color : '#cbd5e1'}`,
                flexShrink: 0,
                marginTop: 4,
              }} />
              {!esUltimo && (
                <div style={{ width: 2, flex: 1, minHeight: 28, background: '#e2e8f0', margin: '2px 0' }} />
              )}
            </div>

            {/* Contenido */}
            <div style={{ paddingBottom: esUltimo ? 0 : 10, flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontSize: '0.8125rem',
                fontWeight: i === 0 || esUltimo ? 700 : 500,
                color: i === 0 || esUltimo ? '#0f172a' : '#334155',
                lineHeight: 1.4,
              }}>
                {p.nombre}
              </p>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>
                Parada #{p.orden} · {p.minutosDesdeInicio === 0 ? 'Inicio' : `+${p.minutosDesdeInicio} min`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Componente principal ─────────────────────────────── */
/**
 * RutaCard — tarjeta expandible para una ruta de TransBus.
 * @param {{ ruta: Object }} props
 */
export default function RutaCard({ ruta }) {
  const [expandida, setExpandida] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSentido, setSelectedSentido] = useState(null)
  const colors = getColores(ruta)

  const sentidoLabel = ruta.sentido === 'circular' ? 'Circular' : 'Ida y vuelta'
  const SentidoIcon  = ruta.sentido === 'circular' ? IconRefresh : IconArrowsLeftRight

  const handleVerParadas = (sentido) => {
    setSelectedSentido(sentido)
    setModalOpen(true)
  }

  return (
    <article
      id={`ruta-card-${ruta.id}`}
      style={{
        background:   '#ffffff',
        borderRadius: 16,
        border:       '1px solid #e2e8f0',
        overflow:     'hidden',
        boxShadow:    '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── Cabecera (siempre visible) ─────────────────── */}
      <button
        onClick={() => setExpandida(v => !v)}
        aria-expanded={expandida}
        aria-controls={`detalle-${ruta.id}`}
        style={{
          width:      '100%',
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          padding:    '16px 16px 14px',
          textAlign:  'left',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Fila 1: badge código + sentido + flecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            background:   colors.bg,
            color:        colors.text,
            fontWeight:   800,
            fontSize:     '0.875rem',
            borderRadius: 8,
            padding:      '3px 12px',
            letterSpacing: '0.02em',
          }}>
            {ruta.codigo}
          </span>

          <span style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        4,
            fontSize:   '0.6875rem',
            color:      '#64748b',
            fontWeight: 500,
          }}>
            <SentidoIcon size={12} stroke={2} />
            {sentidoLabel}
          </span>

          <IconChevronDown
            size={18}
            color="#94a3b8"
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              transition: 'transform 0.25s',
              transform:  expandida ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>

        {/* Fila 2: nombre de la ruta */}
        <h2 style={{
          margin:     '0 0 3px',
          fontSize:   '1rem',
          fontWeight: 700,
          color:      '#0f172a',
          lineHeight: 1.35,
        }}>
          {ruta.nombre}
        </h2>

        {/* Fila 3: operador */}
        <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
          {ruta.operador}
        </p>

        {/* Fila 4: chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip icon={IconCoin} color="#b45309" bg="#fef3c7">
            {ruta.pasaje !== null && ruta.pasaje !== undefined
              ? `S/ ${typeof ruta.pasaje === 'number' ? ruta.pasaje.toFixed(2) : ruta.pasaje}`
              : (ruta.pasajeNota ?? 'Por confirmar')}
          </Chip>
          {ruta.duracionMin != null && (
            <Chip icon={IconClock} color="#1d6fe8" bg="#e8f0fd">
              {ruta.duracionMin} min
            </Chip>
          )}
          {ruta.frecuenciaMin != null && (
            <Chip icon={IconBus} color="#16a34a" bg="#dcfce7">
              c/ {ruta.frecuenciaMin} min
            </Chip>
          )}
          {ruta.totalParadas != null && (
            <Chip icon={IconMapPin} color="#7c3aed" bg="#f5f3ff">
              {ruta.totalParadas} paradas
            </Chip>
          )}
        </div>
      </button>

      {/* ── Detalle expandible ────────────────────────── */}
      <div
        id={`detalle-${ruta.id}`}
        style={{
          maxHeight:  expandida ? '600px' : '0px',
          overflow:   'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 16px 18px' }}>
          {/* Origen → Destino */}
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            marginBottom: 16,
            background:   '#f8fafc',
            borderRadius: 10,
            padding:      '10px 12px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>DESDE</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                {ruta.origen}
              </p>
            </div>
            <IconArrowsLeftRight size={16} color="#cbd5e1" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>HASTA</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                {ruta.destino}
              </p>
            </div>
          </div>

          {ruta.paraderosDestacados?.length > 0 && (
            <>
              <p style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Paradas destacadas
              </p>
              <TimelineParadas paradas={ruta.paraderosDestacados} color={colors.text} />
            </>
          )}

          {/* Botones para ver todas las paradas por sentido */}
          {ruta.sentidos && ruta.sentidos.length > 0 && (
            <div style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ver todas las paradas
              </p>
              {ruta.sentidos.map((sentido) => (
                <button
                  key={sentido.id}
                  onClick={() => handleVerParadas(sentido)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    marginBottom: '4px',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.text}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.text
                    e.target.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.bg
                    e.target.style.color = colors.text
                  }}
                >
                  <IconMapPin size={14} stroke={2} />
                  {sentido.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de paradas */}
      <ParadasModal
        ruta={ruta}
        sentido={selectedSentido}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </article>
  )
}
