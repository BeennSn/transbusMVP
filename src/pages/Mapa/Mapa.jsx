import { useState, useEffect } from 'react'
import {
  IconBus,
  IconClock,
  IconMapPin,
  IconCircleCheckFilled,
  IconUsers,
  IconAlertTriangle,
} from '@tabler/icons-react'
import MapaLeaflet         from '@/components/mapa/MapaLeaflet'
import LoginModal          from '@/components/common/LoginModal'
import ModalReporteExito   from '@/components/mapa/ModalReporteExito'
import { useAuth }         from '@/context/AuthContext'
import useReportesEnVivo   from '@/hooks/useReportesEnVivo'
import { crearReporte, obtenerTotalHistorico } from '@/services/reportesService'

/* ── Ruta que se muestra en /mapa (mock hasta tener selección dinámica) */
const RUTA_ID     = 'b1-nuevo-california'
const RUTA_NOMBRE = 'B1 de Nuevo California'
const RUTA_COD    = 'B1'

/* ─────────────────────────────────────────────────────────
   Tiers de confianza (lógica validada — no modificar)
───────────────────────────────────────────────────────── */
function getTierConfianza(cantidad) {
  if (cantidad === 0) return {
    label:  'Sin reportes recientes',
    tiempo: '~25 min',
    color:  '#64748b',
    bg:     '#f1f5f9',
    dot:    '#94a3b8',
  }
  if (cantidad === 1) return {
    label:  'Estimación inicial',
    tiempo: '~22 min',
    color:  '#b45309',
    bg:     '#fef3c7',
    dot:    '#f59e0b',
  }
  if (cantidad <= 3) return {
    label:  'Estimación moderada',
    tiempo: '~20 min',
    color:  '#b45309',
    bg:     '#fef3c7',
    dot:    '#f59e0b',
  }
  return {
    label:  'Estimación de alta confianza',
    tiempo: '18 min',
    color:  '#15803d',
    bg:     '#dcfce7',
    dot:    '#22c55e',
  }
}

/* ── Chip de información ───────────────────────────────── */
function InfoChip({ icon: Icon, label, color = '#1d6fe8', bg = '#e8f0fd' }) {
  return (
    <div style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:         5,
      background:  bg,
      color,
      borderRadius: 999,
      padding:     '5px 12px',
      fontSize:    '0.8125rem',
      fontWeight:  600,
      whiteSpace:  'nowrap',
    }}>
      <Icon size={14} stroke={2.2} />
      {label}
    </div>
  )
}

/* ── Botones de estado opcionales ─────────────────────── */
const ESTADOS = [
  { valor: 'lleno',        emoji: '😰', label: 'Va lleno'       },
  { valor: 'vacio',        emoji: '🪑', label: 'Va vacío'        },
  { valor: 'cambio_ruta',  emoji: '⚠️', label: 'Cambió de ruta' },
]

function SelectorEstado({ seleccionado, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Opcional — ¿cómo va el bus?
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ESTADOS.map(({ valor, emoji, label }) => {
          const activo = seleccionado === valor
          return (
            <button
              key={valor}
              id={`estado-${valor}`}
              onClick={() => onChange(activo ? null : valor)}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          5,
                background:   activo ? '#e8f0fd' : '#f8fafc',
                color:        activo ? '#1d6fe8' : '#475569',
                border:       `1.5px solid ${activo ? '#1d6fe8' : '#e2e8f0'}`,
                borderRadius: 999,
                padding:      '6px 12px',
                fontSize:     '0.8125rem',
                fontWeight:   600,
                cursor:       'pointer',
                transition:   'all 0.15s',
                fontFamily:   "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {emoji} {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Página principal ──────────────────────────────────── */
export default function Mapa() {
  const { usuario } = useAuth()
  const { cantidadActiva, cargando: cargandoReportes, error: errorReportes } = useReportesEnVivo(RUTA_ID)

  const [sheetExpanded,  setSheetExpanded]  = useState(false)
  const [mostrarLogin,   setMostrarLogin]   = useState(false)
  const [mostrarExito,   setMostrarExito]   = useState(false)
  const [estadoSelected, setEstadoSelected] = useState(null)
  const [enviando,       setEnviando]       = useState(false)
  const [totalHistorico, setTotalHistorico] = useState(0)
  const [errorReporte,   setErrorReporte]   = useState(null)

  const tier = getTierConfianza(cantidadActiva)

  // Carga el contador histórico al montar
  useEffect(() => {
    obtenerTotalHistorico(RUTA_ID).then(setTotalHistorico)
  }, [])

  /* ── Flujo de reporte ────────────────────────────────── */
  async function handleReporte() {
    if (!usuario) {
      setMostrarLogin(true)
      return
    }
    setEnviando(true)
    setErrorReporte(null)
    try {
      await crearReporte(RUTA_ID, usuario.uid, estadoSelected)
      // Actualiza el total histórico local tras el reporte exitoso
      const nuevoTotal = await obtenerTotalHistorico(RUTA_ID)
      setTotalHistorico(nuevoTotal)
      setEstadoSelected(null)
      setMostrarExito(true)
    } catch (err) {
      console.error('[TransBus] Error al crear reporte:', err)
      setErrorReporte('No se pudo enviar el reporte. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div style={{ position: 'relative', height: 'calc(100dvh - 64px)', overflow: 'hidden' }}>

      {/* Mapa */}
      <div style={{ width: '100%', height: '100%' }}>
        <MapaLeaflet />
      </div>

      {/* ── Header flotante ─────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 500, padding: '14px 16px 0', pointerEvents: 'none',
      }}>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          gap:            10,
          background:     'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderRadius:   14,
          padding:        '10px 14px',
          boxShadow:      '0 2px 12px rgba(0,0,0,0.10)',
          pointerEvents:  'auto',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#e8f0fd',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IconBus size={20} color="#1d6fe8" stroke={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Trujillo, Perú
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0f172a', fontWeight: 700 }}>
              {usuario
                ? `Hola, ${usuario.displayName?.split(' ')[0]} 👋`
                : 'TransBus — Ruta B1'}
            </p>
          </div>

          {/* Badge reportes activos en tiempo real */}
          {!cargandoReportes && (
            <div style={{
              display:        'flex',
              alignItems:     'center',
              gap:            5,
              background:     tier.bg,
              color:          tier.color,
              borderRadius:   999,
              padding:        '5px 10px',
              fontSize:       '0.75rem',
              fontWeight:     700,
              flexShrink:     0,
              whiteSpace:     'nowrap',
            }}>
              <IconUsers size={13} stroke={2.2} />
              {cantidadActiva} activos
            </div>
          )}

          {/* Dot "En vivo" */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            color: '#16a34a', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#16a34a',
              display: 'inline-block', animation: 'blink 1.4s ease-in-out infinite',
            }} />
            En vivo
          </div>
        </div>
      </div>

      {/* ── Bottom sheet ────────────────────────────────── */}
      <div
        id="mapa-bottom-sheet"
        className="map-bottom-sheet"
        style={{
          maxHeight:  sheetExpanded ? '80%' : '290px',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY:  'auto',
        }}
      >
        {/* Drag handle */}
        <button
          aria-label={sheetExpanded ? 'Contraer' : 'Expandir'}
          onClick={() => setSheetExpanded(v => !v)}
          style={{
            display: 'block', margin: '0 auto 14px',
            width: 40, height: 5, borderRadius: 3, background: '#e2e8f0',
            border: 'none', cursor: 'pointer', padding: 0,
          }}
        />

        {/* Nombre + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{
                background: '#e8f0fd', color: '#1d6fe8',
                fontWeight: 800, fontSize: '0.8125rem', borderRadius: 8, padding: '2px 10px',
              }}>
                {RUTA_COD}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
              {RUTA_NOMBRE}
            </h2>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#dcfce7', color: '#15803d', borderRadius: 999,
            padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
          }}>
            <IconCircleCheckFilled size={13} />
            En servicio
          </div>
        </div>

        {/* Error global de reportes (ej. falta índice) */}
        {errorReportes && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fef2f2', borderRadius: 10, padding: '8px 12px', marginBottom: 10,
          }}>
            <IconAlertTriangle size={15} color="#dc2626" stroke={2} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500 }}>
              {errorReportes}
            </p>
          </div>
        )}

        {/* Skeleton o Contenido real */}
        {cargandoReportes ? (
          <div style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
            <div style={{ height: 50, background: '#f1f5f9', borderRadius: 12, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <div style={{ height: 26, width: 80, background: '#f1f5f9', borderRadius: 999 }} />
              <div style={{ height: 26, width: 60, background: '#f1f5f9', borderRadius: 999 }} />
            </div>
            <div style={{ height: 60, background: '#f1f5f9', borderRadius: 12, marginBottom: 10 }} />
          </div>
        ) : (
          <>
            {/* Chip de estimación con tier de confianza */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              background:   tier.bg,
              borderRadius: 12,
              padding:      '10px 14px',
              marginBottom: 10,
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: tier.dot, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: tier.color }}>
                  {tier.label}
                </p>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: tier.color, opacity: 0.8 }}>
                  {`${cantidadActiva} reporte${cantidadActiva !== 1 ? 's' : ''} en los últimos 15 min`}
                </p>
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: tier.color, flexShrink: 0 }}>
                {tier.tiempo}
              </span>
            </div>

            {/* Chips secundarios */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <InfoChip icon={IconMapPin} label="44 paradas"  color="#7c3aed" bg="#f5f3ff" />
              <InfoChip icon={IconBus}    label="S/ 2.00"      color="#b45309" bg="#fef3c7" />
              <InfoChip icon={IconClock}  label="c/ 7 min"    color="#16a34a" bg="#dcfce7" />
            </div>

            {/* Selector de estado (opcional) */}
            <SelectorEstado
              seleccionado={estadoSelected}
              onChange={setEstadoSelected}
            />
          </>
        )}

        {/* Error de reporte */}
        {errorReporte && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fef2f2', borderRadius: 10, padding: '8px 12px', marginBottom: 10,
          }}>
            <IconAlertTriangle size={15} color="#dc2626" stroke={2} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500 }}>
              {errorReporte}
            </p>
          </div>
        )}

        {/* CTA principal */}
        <button
          id="btn-reporte-bus"
          className="btn-primary"
          onClick={handleReporte}
          disabled={enviando}
          style={{
            marginBottom: 4,
            opacity:      enviando ? 0.7 : 1,
            cursor:       enviando ? 'not-allowed' : 'pointer',
          }}
        >
          <IconBus size={18} stroke={2.2} />
          {enviando ? 'Enviando reporte…' : 'Acabo de subir a este bus'}
        </button>

        {/* Hint contextual */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: '6px 0 0' }}>
          {usuario
            ? `Tu reporte #${totalHistorico + 1} en esta ruta 🙌`
            : '🔒 Necesitas iniciar sesión para reportar'}
        </p>
      </div>

      {/* ── Modales ─────────────────────────────────────── */}
      {mostrarLogin && (
        <LoginModal
          onClose={() => setMostrarLogin(false)}
          onLoginSuccess={() => setMostrarLogin(false)}
        />
      )}

      {mostrarExito && (
        <ModalReporteExito
          onClose={() => setMostrarExito(false)}
          cantidadActiva={cantidadActiva}
          totalHistorico={totalHistorico}
          nombreUsuario={usuario?.displayName}
        />
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
