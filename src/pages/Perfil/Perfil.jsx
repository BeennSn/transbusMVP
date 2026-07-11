import { useState } from 'react'
import { useAuth }             from '@/hooks/useAuth'
import useReportesUsuario      from '@/hooks/useReportesUsuario'
import LoginModal              from '@/components/common/LoginModal'
import {
  IconLogout,
  IconBrandGoogle,
  IconUser,
  IconMail,
  IconAlertTriangle,
  IconAward,
} from '@tabler/icons-react'

/* ── helpers ───────────────────────────────────────────── */
const RUTA_LABELS = {
  'b1-nuevo-california': 'B1',
  'h-huanchaco':         'H',
}

const ESTADO_LABELS = {
  lleno:       '😰 Va lleno',
  vacio:       '🪑 Va vacío',
  cambio_ruta: '⚠️ Cambió de ruta',
}

function formatFecha(timestamp) {
  if (!timestamp) return '—'
  const ms = timestamp?.toMillis?.() ?? timestamp
  return new Date(ms).toLocaleString('es-PE', {
    day:    '2-digit',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/* ── Pantalla si NO hay sesión ─────────────────────────── */
function PantallaNoSesion() {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      'calc(100dvh - 64px)',
      padding:        '32px 24px',
      fontFamily:     "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #e8f0fd 0%, #c7d9fa 100%)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', marginBottom: 20,
      }}>👤</div>

      <h1 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
        Tu perfil en TransBus
      </h1>
      <p style={{ margin: '0 0 28px', fontSize: '0.875rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
        Inicia sesión para ver tu historial de reportes y contribuir a la comunidad.
      </p>

      <button
        id="btn-perfil-login"
        onClick={() => setMostrarModal(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#1d6fe8', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '0.9375rem', padding: '14px 28px',
          borderRadius: 999, border: 'none', cursor: 'pointer', width: '100%', maxWidth: 320,
        }}
      >
        <IconBrandGoogle size={20} stroke={2} />
        Iniciar sesión con Google
      </button>

      {mostrarModal && (
        <LoginModal
          onClose={() => setMostrarModal(false)}
          onLoginSuccess={() => setMostrarModal(false)}
        />
      )}
    </div>
  )
}

/* ── Pantalla si SÍ hay sesión ─────────────────────────── */
function PantallaConSesion({ usuario, logout }) {
  const [saliendo, setSaliendo] = useState(false)
  const { reportes, totalReportes, estaSemana, cargando, error } = useReportesUsuario(usuario.uid)

  const esColaboradorActivo = estaSemana >= 3

  async function handleLogout() {
    setSaliendo(true)
    await logout()
  }

  return (
    <main className="page-container" style={{ background: '#f5f7fa' }}>

      {/* Header */}
      <header style={{
        background: '#ffffff', padding: '20px 16px 16px',
        borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#e8f0fd',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IconUser size={20} color="#1d6fe8" stroke={2} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
            Mi perfil
          </h1>
        </div>
      </header>

      <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Tarjeta de usuario */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {usuario.photoURL ? (
            <img
              src={usuario.photoURL}
              alt={usuario.displayName ?? 'Avatar'}
              style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: '#e8f0fd', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.5rem',
            }}>👤</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              {usuario.displayName ?? 'Sin nombre'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <IconMail size={13} color="#94a3b8" stroke={2} />
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                {usuario.email}
              </p>
            </div>
            {esColaboradorActivo && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#fef9c3', color: '#a16207', borderRadius: 999,
                padding: '2px 8px', fontSize: '0.6875rem', fontWeight: 700,
              }}>
                <IconAward size={12} stroke={2.5} />
                Colaborador activo
              </div>
            )}
          </div>
        </div>

        {/* Error global */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fef2f2', borderRadius: 10, padding: '10px 14px',
          }}>
            <IconAlertTriangle size={16} color="#dc2626" stroke={2} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500, lineHeight: 1.4 }}>
              {error}
            </p>
          </div>
        )}

        {/* Stats reales */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Mis reportes
          </p>

          {cargando ? (
            <div style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ height: 80, background: '#f1f5f9', borderRadius: 12 }} />
                <div style={{ height: 80, background: '#f1f5f9', borderRadius: 12 }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { valor: totalReportes, label: 'Reportes totales', icon: '🚌', color: '#1d6fe8', bg: '#e8f0fd' },
                { valor: estaSemana,    label: 'Esta semana',      icon: '📅', color: '#15803d', bg: '#dcfce7' },
              ].map(({ valor, label, icon, color, bg }) => (
                <div key={label} style={{ background: bg, borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '1rem' }}>{icon}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{valor}</p>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color, fontWeight: 600, opacity: 0.85 }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial de reportes */}
        {!cargando && reportes.length > 0 && (
          <div style={{
            background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
            padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Historial reciente
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reportes.slice(0, 10).map((r, i) => {
                const rutaCod = RUTA_LABELS[r.rutaId] ?? r.rutaId
                return (
                  <div
                    key={r.id}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          10,
                      background:   '#f8fafc',
                      borderRadius: 10,
                      padding:      '10px 12px',
                    }}
                  >
                    {/* Badge ruta */}
                    <span style={{
                      background:   rutaCod === 'B1' ? '#e8f0fd' : '#fce7f3',
                      color:        rutaCod === 'B1' ? '#1d6fe8' : '#be185d',
                      fontWeight:   800, fontSize: '0.75rem',
                      borderRadius: 6, padding: '2px 8px', flexShrink: 0,
                    }}>
                      {rutaCod}
                    </span>

                    {/* Estado y hora */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
                        {r.estado ? ESTADO_LABELS[r.estado] : 'Subí al bus'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>
                        {formatFecha(r.timestamp)}
                      </p>
                    </div>

                    {/* Número de contribución */}
                    <span style={{ fontSize: '0.6875rem', color: '#cbd5e1', fontWeight: 600, flexShrink: 0 }}>
                      #{totalReportes - i}
                    </span>
                  </div>
                )
              })}
            </div>

            {reportes.length > 10 && (
              <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                + {reportes.length - 10} reportes más en el historial
              </p>
            )}
          </div>
        )}

        {/* Sin reportes aún */}
        {!cargando && reportes.length === 0 && (
          <div style={{
            background: '#f8fafc', borderRadius: 16, border: '1px dashed #e2e8f0',
            padding: '24px 16px', textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: '1.5rem' }}>🚌</p>
            <p style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Aún no has reportado
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
              Ve al mapa y toca "Acabo de subir a este bus"
            </p>
          </div>
        )}

        {/* Cerrar sesión */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          disabled={saliendo}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: saliendo ? '#f1f5f9' : '#fef2f2',
            color: saliendo ? '#94a3b8' : '#dc2626',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: '0.9375rem', padding: '14px 24px',
            borderRadius: 999, border: `1px solid ${saliendo ? '#e2e8f0' : '#fecaca'}`,
            cursor: saliendo ? 'not-allowed' : 'pointer', width: '100%', transition: 'background 0.15s',
          }}
        >
          <IconLogout size={18} stroke={2} />
          {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </main>
  )
}

/* ── Exportación principal ─────────────────────────────── */
export default function Perfil() {
  const { usuario, logout } = useAuth()
  if (!usuario) return <PantallaNoSesion />
  return <PantallaConSesion usuario={usuario} logout={logout} />
}
