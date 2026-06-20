import { useState, useEffect } from 'react'
import {
  IconBus,
  IconClock,
  IconMapPin,
  IconCircleCheckFilled,
  IconUsers,
  IconAlertTriangle,
  IconArrowsExchange,
  IconX,
  IconCurrentLocation,
} from '@tabler/icons-react'
import MapaLeaflet        from '@/components/mapa/MapaLeaflet'
import LoginModal         from '@/components/common/LoginModal'
import ModalReporteExito  from '@/components/mapa/ModalReporteExito'
import { useAuth }        from '@/context/AuthContext'
import useReportesEnVivo  from '@/hooks/useReportesEnVivo'
import useUbicacionUsuario from '@/hooks/useUbicacionUsuario'
import { crearReporte, obtenerTotalHistorico } from '@/services/reportesService'
import { getRutaById, getRutas } from '@/services/rutasService'
import { calcularDistanciaEntreDosPuntos } from '@/utils/geo'

/* ── Todas las rutas disponibles (leídas una sola vez del JSON) */
const TODAS_LAS_RUTAS = getRutas()

/* ── Colores por código de ruta */
const COLORES_RUTA = { B1: '#1d6fe8', H: '#be185d' }

/* ─────────────────────────────────────────────────────────
   Tiers de confianza (lógica validada — no modificar)
───────────────────────────────────────────────────────── */
function getTierConfianza(cantidad) {
  if (cantidad === 0) return { label: 'Sin reportes recientes', tiempo: '~25 min', color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' }
  if (cantidad === 1) return { label: 'Estimación inicial',     tiempo: '~22 min', color: '#b45309', bg: '#fef3c7', dot: '#f59e0b' }
  if (cantidad <= 3)  return { label: 'Estimación moderada',    tiempo: '~20 min', color: '#b45309', bg: '#fef3c7', dot: '#f59e0b' }
  return                     { label: 'Estimación de alta confianza', tiempo: '18 min', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' }
}

/* ── Chip de información ───────────────────────────────── */
function InfoChip({ icon: Icon, label, color = '#1d6fe8', bg = '#e8f0fd' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: bg, color, borderRadius: 999, padding: '5px 12px',
      fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <Icon size={14} stroke={2.2} />
      {label}
    </div>
  )
}

/* ── Botones de estado opcionales ─────────────────────── */
const ESTADOS = [
  { valor: 'lleno',       emoji: '😰', label: 'Va lleno'       },
  { valor: 'vacio',       emoji: '🪑', label: 'Va vacío'        },
  { valor: 'cambio_ruta', emoji: '⚠️', label: 'Cambió de ruta' },
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
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: activo ? '#e8f0fd' : '#f8fafc',
                color:      activo ? '#1d6fe8' : '#475569',
                border:    `1.5px solid ${activo ? '#1d6fe8' : '#e2e8f0'}`,
                borderRadius: 999, padding: '6px 12px',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif",
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

  /* ── Ruta seleccionada (debe declararse antes de los hooks) */
  const [rutaId, setRutaId] = useState('b1-nuevo-california')

  const { cantidadActiva, cargando: cargandoReportes, error: errorReportes } = useReportesEnVivo(rutaId)
  const {
    ubicacion,
    permisoPedido,
    permisoDenegado,
    cargando: cargandoGPS,
    solicitarUbicacion,
  } = useUbicacionUsuario()

  /* ── Datos reactivos según ruta seleccionada ─────────────── */
  const rutaData  = getRutaById(rutaId)
  const sentidos  = rutaData?.sentidos ?? []
  const colorRuta = COLORES_RUTA[rutaData?.codigo] ?? '#1d6fe8'

  /* ── Estado de UI ──────────────────────────────────────── */
  const [sentidoIdx,      setSentidoIdx]      = useState(0)
  const [sentidoSugerido, setSentidoSugerido] = useState(null)
  const [sheetExpanded,   setSheetExpanded]   = useState(false)
  const [mostrarLogin,    setMostrarLogin]    = useState(false)
  const [mostrarExito,    setMostrarExito]    = useState(false)
  const [estadoSelected,  setEstadoSelected]  = useState(null)
  const [enviando,        setEnviando]        = useState(false)
  const [totalHistorico,  setTotalHistorico]  = useState(0)
  const [errorReporte,    setErrorReporte]    = useState(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  /* ── Al cambiar de ruta: resetea sentido e historial ────── */
  function cambiarRuta(nuevoId) {
    setRutaId(nuevoId)
    setSentidoIdx(0)
    setSentidoSugerido(null)
    setTotalHistorico(0)
    obtenerTotalHistorico(nuevoId).then(setTotalHistorico)
  }

  /* ── Auto-selección del sentido más cercano al usuario ── */
  useEffect(() => {
    if (!ubicacion || sentidos.length === 0) return
    const distancias = sentidos.map((s) => {
      const p = s.coordenadas?.[0]
      if (!p) return Infinity
      return calcularDistanciaEntreDosPuntos(ubicacion, [p.latitude, p.longitude])
    })
    const idxCercano = distancias.indexOf(Math.min(...distancias))
    setSentidoSugerido(idxCercano)
    setSentidoIdx(idxCercano)
  }, [ubicacion]) // eslint-disable-line react-hooks/exhaustive-deps
  // (sentidos no cambia en runtime, no necesita ser dep)

  /* ── Carga inicial del contador histórico ─────────────── */
  useEffect(() => {
    obtenerTotalHistorico(rutaId).then(setTotalHistorico)
  }, [])

  /* ── Derivados ─────────────────────────────────────────── */
  const sentidoActual  = sentidos[sentidoIdx]
  const coordenadasRuta = sentidoActual?.coordenadas?.map(c => [c.latitude, c.longitude]) ?? null
  // Clave única para que MapController detecte cambio de sentido
  const sentidoKey     = `${rutaId}-${sentidoIdx}`
  const tier           = getTierConfianza(cantidadActiva)
  const esSugerido     = sentidoSugerido !== null && sentidoSugerido === sentidoIdx

  /* ── Flujo de reporte ─────────────────────────────────── */
  async function handleReporte() {
    if (!usuario) { setMostrarLogin(true); return }
    setEnviando(true)
    setErrorReporte(null)
    try {
      await crearReporte(rutaId, usuario.uid, estadoSelected)
      const nuevoTotal = await obtenerTotalHistorico(rutaId)
      setTotalHistorico(nuevoTotal)
      setEstadoSelected(null)
      setMostrarExito(true)
    } catch {
      setErrorReporte('No se pudo enviar el reporte. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div style={{ position: 'relative', height: 'calc(100dvh - 64px)', overflow: 'hidden' }}>

      {/* ── Mapa ────────────────────────────────────────── */}
      <div style={{ width: '100%', height: '100%' }}>
        <MapaLeaflet
          rutaCodigo={rutaData?.codigo ?? 'B1'}
          rutaNombre={rutaData?.nombre ?? ''}
          ubicacionUsuario={ubicacion}
          coordenadasRuta={coordenadasRuta}
          colorRuta={colorRuta}
          sentidoKey={sentidoKey}
        />
      </div>

      {/* ── Header flotante ─────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 500, padding: '14px 16px 0', pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
          borderRadius: 14, padding: '10px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)', pointerEvents: 'auto',
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
              {usuario ? `Hola, ${usuario.displayName?.split(' ')[0]} 👋` : `TransBus — ${rutaData?.codigo ?? 'B1'}`}
            </p>
          </div>

          {/* Badge reportes activos */}
          {!cargandoReportes && !errorReportes && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: tier.bg, color: tier.color, borderRadius: 999,
              padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700,
              flexShrink: 0, whiteSpace: 'nowrap',
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

      {/* ── Banner de ubicación (antes del primer permiso) ── */}
      {!permisoPedido && !bannerDismissed && (
        <div style={{
          position: 'absolute', bottom: 310, left: 16, right: 16, zIndex: 600,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)',
          borderRadius: 14, padding: '12px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📍</span>
          <p style={{ margin: 0, flex: 1, fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
            Activa tu ubicación para verte en el mapa y mejorar tus reportes
          </p>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setBannerDismissed(true)}
              aria-label="Cerrar banner"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8', borderRadius: 6 }}
            >
              <IconX size={16} />
            </button>
            <button
              id="btn-activar-ubicacion"
              onClick={() => { solicitarUbicacion(); setBannerDismissed(true) }}
              style={{
                background: '#1d6fe8', color: '#fff', border: 'none', borderRadius: 999,
                padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Activar
            </button>
          </div>
        </div>
      )}

      {/* ── Aviso discreto si permiso denegado ──────────── */}
      {permisoPedido && permisoDenegado && (
        <div style={{
          position: 'absolute', bottom: 310, left: 16, right: 16, zIndex: 600,
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
          padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <IconCurrentLocation size={16} color="#ea580c" stroke={2} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9a3412', fontWeight: 500 }}>
            Sin ubicación — el mapa muestra el trazado completo de la ruta.
          </p>
        </div>
      )}

      {/* ── Bottom sheet ────────────────────────────────── */}
      <div
        id="mapa-bottom-sheet"
        className="map-bottom-sheet"
        style={{
          maxHeight:  sheetExpanded ? '80%' : '300px',
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

        {/* ── Selector de rutas ────────────────────────────────── */}
        <div style={{
          display:        'flex',
          gap:            8,
          overflowX:      'auto',
          marginBottom:   14,
          paddingBottom:  4,
          scrollbarWidth: 'none',  /* Firefox */
          msOverflowStyle: 'none',
        }}>
          {TODAS_LAS_RUTAS.map((r) => {
            const activa  = r.id === rutaId
            const color   = COLORES_RUTA[r.codigo] ?? '#1d6fe8'
            return (
              <button
                key={r.id}
                id={`btn-ruta-${r.id}`}
                onClick={() => cambiarRuta(r.id)}
                style={{
                  display:     'inline-flex',
                  alignItems:  'center',
                  gap:         6,
                  flexShrink:  0,
                  background:  activa ? color : '#f8fafc',
                  color:       activa ? '#ffffff' : '#475569',
                  border:      `1.5px solid ${activa ? color : '#e2e8f0'}`,
                  borderRadius: 999,
                  padding:     '7px 14px',
                  fontSize:    '0.8125rem',
                  fontWeight:  700,
                  cursor:      'pointer',
                  transition:  'all 0.18s',
                  fontFamily:  "'Plus Jakarta Sans', sans-serif",
                  boxShadow:   activa ? `0 2px 8px ${color}44` : 'none',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: activa ? '#ffffff' : color,
                  flexShrink: 0,
                  opacity: activa ? 0.85 : 1,
                }} />
                {r.codigo} — {r.nombre.split(' - ')[1] ?? r.nombre}
              </button>
            )
          })}
        </div>

        {/* Nombre de ruta + badge estado */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{
                background: colorRuta + '22', color: colorRuta,
                fontWeight: 800, fontSize: '0.8125rem', borderRadius: 8, padding: '2px 10px',
              }}>
                {rutaData?.codigo ?? 'B1'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
              {rutaData?.nombre ?? 'B1 de Nuevo California'}
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

        {/* Toggle de sentido (ida / vuelta) */}
        {sentidos.length > 1 && (
          <div style={{ marginBottom: 10 }}>
            {esSugerido && ubicacion && (
              <p style={{
                margin: '0 0 6px', fontSize: '0.6875rem', color: '#b45309',
                fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ✦ Sugerido según tu ubicación
              </p>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sentidos.map((s, idx) => {
                const activo = idx === sentidoIdx
                return (
                  <button
                    key={s.id ?? idx}
                    id={`btn-sentido-${idx}`}
                    onClick={() => { setSentidoIdx(idx); setSentidoSugerido(null) }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      flex: 1, justifyContent: 'center',
                      background: activo ? colorRuta : '#f8fafc',
                      color:      activo ? '#ffffff'  : '#475569',
                      border:    `1.5px solid ${activo ? colorRuta : '#e2e8f0'}`,
                      borderRadius: 999, padding: '7px 10px',
                      fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <IconArrowsExchange size={14} stroke={2} />
                    {s.nombre ?? `Sentido ${idx + 1}`}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Error de Firestore */}
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

        {/* Skeleton o contenido real */}
        {cargandoReportes ? (
          <div style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
            <div style={{ height: 50, background: '#f1f5f9', borderRadius: 12, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <div style={{ height: 26, width: 80, background: '#f1f5f9', borderRadius: 999 }} />
              <div style={{ height: 26, width: 60, background: '#f1f5f9', borderRadius: 999 }} />
            </div>
          </div>
        ) : (
          <>
            {/* Chip de estimación */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: tier.bg, borderRadius: 12, padding: '10px 14px', marginBottom: 10,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: tier.dot, flexShrink: 0 }} />
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
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              <InfoChip icon={IconMapPin} label="44 paradas"  color="#7c3aed" bg="#f5f3ff" />
              <InfoChip icon={IconBus}    label="S/ 2.00"     color="#b45309" bg="#fef3c7" />
              <InfoChip icon={IconClock}  label="c/ 7 min"   color="#16a34a" bg="#dcfce7" />
            </div>

            {/* Selector de estado */}
            <SelectorEstado seleccionado={estadoSelected} onChange={setEstadoSelected} />
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
          style={{ marginBottom: 4, opacity: enviando ? 0.7 : 1, cursor: enviando ? 'not-allowed' : 'pointer' }}
        >
          <IconBus size={18} stroke={2.2} />
          {enviando ? 'Enviando reporte…' : 'Acabo de subir a este bus'}
        </button>

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
