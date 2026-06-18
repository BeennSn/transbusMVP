import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { IconBrandGoogle, IconX } from '@tabler/icons-react'

/**
 * LoginModal — aparece cuando el usuario intenta hacer una acción
 * que requiere autenticación (ej: reportar un bus).
 *
 * @param {{ onClose: () => void, onLoginSuccess?: () => void }} props
 */
export default function LoginModal({ onClose, onLoginSuccess }) {
  const { login } = useAuth()
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  async function handleLogin() {
    setCargando(true)
    setError(null)
    try {
      await login()
      onLoginSuccess?.()
      onClose()
    } catch (err) {
      setError('No se pudo iniciar sesión. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(15, 23, 42, 0.55)',
        backdropFilter:  'blur(4px)',
        zIndex:          900,
        display:         'flex',
        alignItems:      'flex-end',
        justifyContent:  'center',
        padding:         '0 0 80px',   /* encima del BottomNav */
        animation:       'fadeIn 0.2s ease',
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        '100%',
          maxWidth:     430,
          background:   '#ffffff',
          borderRadius: '20px 20px 0 0',
          padding:      '24px 24px 28px',
          boxShadow:    '0 -8px 40px rgba(0,0,0,0.15)',
          animation:    'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily:   "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Drag handle + botón cerrar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
          </div>
          <button
            id="modal-cerrar"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: '#94a3b8', borderRadius: 8,
            }}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Ícono central */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{
            width:          64,
            height:         64,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg, #e8f0fd 0%, #c7d9fa 100%)',
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '2rem',
            marginBottom:   12,
          }}>
            🚌
          </div>
          <h2
            id="modal-titulo"
            style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}
          >
            Inicia sesión para reportar
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
            Tu reporte ayuda a todos a saber dónde está el bus en tiempo real. Solo necesitas una cuenta de Google.
          </p>
        </div>

        {/* Beneficios rápidos */}
        <div style={{
          background:   '#f8fafc',
          borderRadius: 12,
          padding:      '12px 14px',
          marginBottom: 20,
          display:      'flex',
          flexDirection:'column',
          gap:          8,
        }}>
          {[
            { icon: '📍', text: 'Comparte tu ubicación del bus con la comunidad' },
            { icon: '⏱️', text: 'Recibe estimaciones de llegada más precisas' },
            { icon: '🙌', text: 'Acumula puntos por cada reporte válido' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p style={{
            background: '#fef2f2', color: '#dc2626', borderRadius: 8,
            padding: '8px 12px', fontSize: '0.8125rem', marginBottom: 12,
            fontWeight: 500,
          }}>
            ⚠️ {error}
          </p>
        )}

        {/* CTA Google */}
        <button
          id="btn-login-google"
          onClick={handleLogin}
          disabled={cargando}
          style={{
            width:          '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            10,
            background:     cargando ? '#e2e8f0' : '#1d6fe8',
            color:          cargando ? '#94a3b8' : '#ffffff',
            fontFamily:     "'Plus Jakarta Sans', sans-serif",
            fontWeight:     700,
            fontSize:       '0.9375rem',
            padding:        '14px 24px',
            borderRadius:   999,
            border:         'none',
            cursor:         cargando ? 'not-allowed' : 'pointer',
            transition:     'background 0.15s, transform 0.1s',
          }}
          onMouseDown={e => !cargando && (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <IconBrandGoogle size={20} stroke={2} />
          {cargando ? 'Abriendo Google…' : 'Continuar con Google'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: '#94a3b8', marginTop: 10, marginBottom: 0 }}>
          Al continuar aceptas los términos de uso de TransBus.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  )
}
