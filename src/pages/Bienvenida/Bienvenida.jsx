import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconBus,
  IconMapPin,
  IconUsers,
  IconClock,
  IconArrowRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

/* ── Los 3 beneficios clave de la oferta ─────────────────── */
const BENEFICIOS = [
  {
    icon:  IconUsers,
    color: '#1d6fe8',
    bg:    '#e8f0fd',
    titulo: 'Reportes en tiempo real',
    texto:  'Otros universitarios reportan si el micro va lleno o cambió de ruta — antes de que llegues al paradero.',
  },
  {
    icon:  IconClock,
    color: '#16a34a',
    bg:    '#dcfce7',
    titulo: 'Estimación de llegada',
    texto:  'Cuanto más reportes hay, más precisa es la estimación. Sin GPS en el bus, sin datos falsos.',
  },
  {
    icon:  IconMapPin,
    color: '#7c3aed',
    bg:    '#f5f3ff',
    titulo: '15 rutas cerca de tu U',
    texto:  'Rutas que pasan por UPAO, UNT, UCV y UPN. Todas con trazado real del recorrido.',
  },
]

export default function Bienvenida() {
  const navigate  = useNavigate()
  const [slide,   setSlide]   = useState(0)    // 0 = hero, 1 = beneficios
  const [saliendo, setSaliendo] = useState(false)

  function entrarAlMapa() {
    setSaliendo(true)
    // Marcar que ya vio la bienvenida
    localStorage.setItem('transbus_bienvenida_vista', '1')
    setTimeout(() => navigate('/mapa', { replace: true }), 320)
  }

  return (
    <div style={{
      minHeight:   '100dvh',
      display:     'flex',
      flexDirection: 'column',
      background:  '#0f172a',
      fontFamily:  "'Plus Jakarta Sans', sans-serif",
      overflow:    'hidden',
      opacity:     saliendo ? 0 : 1,
      transition:  'opacity 0.32s ease',
    }}>

      {slide === 0 ? (
        /* ══════════════════════════════════════════════════
           SLIDE 0 — Hero con oferta concreta
        ══════════════════════════════════════════════════ */
        <>
          {/* Fondo degradado animado */}
          <div style={{
            position:   'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #1e3a5f 0%, #0f172a 70%)',
            pointerEvents: 'none',
          }} />

          {/* Blob de color difuso */}
          <div style={{
            position:   'absolute', top: '8%', left: '50%',
            transform:  'translateX(-50%)',
            width:      260, height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1d6fe840 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Contenido */}
          <div style={{
            position:   'relative', zIndex: 1,
            flex:       1,
            display:    'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding:    '0 28px',
            textAlign:  'center',
          }}>

            {/* Icono principal */}
            <div style={{
              width:          90, height: 90,
              borderRadius:   '28px',
              background:     'linear-gradient(135deg, #1d6fe8 0%, #2563eb 100%)',
              display:        'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom:   24,
              boxShadow:      '0 0 40px #1d6fe860, 0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <IconBus size={48} color="#ffffff" stroke={1.6} />
            </div>

            {/* Badge "piloto" */}
            <div style={{
              display:      'inline-flex', alignItems: 'center', gap: 6,
              background:   '#1d6fe820', border: '1px solid #1d6fe840',
              borderRadius: 999, padding: '4px 14px', marginBottom: 18,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'blink 1.4s infinite' }} />
              <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600, letterSpacing: '0.04em' }}>
                PILOTO · TRUJILLO
              </span>
            </div>

            {/* Titular — la oferta concreta */}
            <h1 style={{
              margin:     '0 0 14px',
              fontSize:   'clamp(1.75rem, 6vw, 2.25rem)',
              fontWeight: 900,
              color:      '#f8fafc',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              Sabe si tu micro<br />va lleno{' '}
              <span style={{
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>antes de salir</span>
            </h1>

            {/* Subtítulo — beneficio inmediato */}
            <p style={{
              margin:     '0 0 36px',
              fontSize:   '1rem',
              color:      '#94a3b8',
              lineHeight: 1.6,
              fontWeight: 400,
            }}>
              Reportes en tiempo real de universitarios como tú.
              Sin cuentas de empresa, sin GPS en el bus.
            </p>

            {/* Prueba social */}
            <div style={{
              display:      'flex', alignItems: 'center', gap: 10,
              background:   '#ffffff0d', border: '1px solid #ffffff15',
              borderRadius: 14, padding: '12px 16px',
              marginBottom: 32, width: '100%', maxWidth: 320,
            }}>
              <IconCircleCheckFilled size={20} color="#22c55e" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                <strong style={{ color: '#f1f5f9' }}>15 rutas activas</strong> — UPAO, UNT, UCV, UPN y Mallplaza
              </p>
            </div>

            {/* CTA principal */}
            <button
              id="btn-ver-beneficios"
              onClick={() => setSlide(1)}
              style={{
                width:        '100%', maxWidth: 320,
                display:      'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background:   'linear-gradient(135deg, #1d6fe8 0%, #2563eb 100%)',
                color:        '#ffffff',
                border:       'none', borderRadius: 16,
                padding:      '15px 20px',
                fontSize:     '1rem', fontWeight: 800,
                cursor:       'pointer',
                boxShadow:    '0 4px 20px #1d6fe840',
                fontFamily:   "'Plus Jakarta Sans', sans-serif",
                marginBottom: 14,
              }}
            >
              Cómo funciona
              <IconArrowRight size={20} stroke={2.5} />
            </button>

            {/* Skip */}
            <button
              id="btn-skip-bienvenida"
              onClick={entrarAlMapa}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', fontSize: '0.875rem', fontWeight: 500,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                padding: '8px 20px',
              }}
            >
              Ir directo al mapa →
            </button>
          </div>

          {/* Dots de navegación */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 0 32px', position: 'relative', zIndex: 1 }}>
            <span style={{ width: 20, height: 6, borderRadius: 3, background: '#1d6fe8' }} />
            <span style={{ width: 6,  height: 6, borderRadius: 3, background: '#334155' }} />
          </div>
        </>

      ) : (
        /* ══════════════════════════════════════════════════
           SLIDE 1 — Los 3 beneficios + CTA final
        ══════════════════════════════════════════════════ */
        <>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: '60px 24px 24px', overflowY: 'auto',
          }}>

            <h2 style={{
              margin:     '0 0 6px',
              fontSize:   '1.625rem', fontWeight: 900,
              color:      '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              ¿Qué ganas con<br />TransBus?
            </h2>
            <p style={{ margin: '0 0 32px', color: '#64748b', fontSize: '0.9rem', fontWeight: 400 }}>
              Tres razones para reportar y consultar
            </p>

            {/* Cards de beneficios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {BENEFICIOS.map(({ icon: Icon, color, bg, titulo, texto }, i) => (
                <div
                  key={i}
                  style={{
                    display:      'flex', gap: 14, alignItems: 'flex-start',
                    background:   '#1e293b',
                    border:       '1px solid #334155',
                    borderRadius: 16, padding: '16px',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} color={color} stroke={2} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9' }}>
                      {titulo}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje de comunidad */}
            <div style={{
              background:   'linear-gradient(135deg, #1e3a5f 0%, #1e2d4f 100%)',
              border:       '1px solid #1d6fe830',
              borderRadius: 16, padding: '14px 16px',
              marginBottom: 28,
              display:      'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: '1.375rem', flexShrink: 0 }}>🎓</span>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#93c5fd', lineHeight: 1.5 }}>
                <strong>El sistema mejora contigo.</strong> Cada reporte que haces ayuda al próximo universitario que espera en el paradero.
              </p>
            </div>

            {/* CTA final */}
            <button
              id="btn-entrar-mapa"
              onClick={entrarAlMapa}
              style={{
                display:    'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'linear-gradient(135deg, #1d6fe8 0%, #2563eb 100%)',
                color:      '#ffffff', border: 'none', borderRadius: 16,
                padding:    '15px 20px', fontSize: '1rem', fontWeight: 800,
                cursor:     'pointer', boxShadow: '0 4px 20px #1d6fe840',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                width:      '100%', marginBottom: 12,
              }}
            >
              <IconBus size={20} stroke={2} />
              Abrir mapa en tiempo real
            </button>

            <p style={{ textAlign: 'center', margin: 0, fontSize: '0.75rem', color: '#475569' }}>
              Sin registrarte puedes ver el mapa y rutas. Solo necesitas cuenta para reportar.
            </p>
          </div>

          {/* Dots de navegación */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 0 32px' }}>
            <span
              style={{ width: 6, height: 6, borderRadius: 3, background: '#334155', cursor: 'pointer' }}
              onClick={() => setSlide(0)}
            />
            <span style={{ width: 20, height: 6, borderRadius: 3, background: '#1d6fe8' }} />
          </div>
        </>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}
