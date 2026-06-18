import { IconX, IconConfetti, IconUsers } from '@tabler/icons-react'

/**
 * ModalReporteExito — aparece tras un reporte exitoso.
 *
 * @param {{
 *   onClose:         () => void,
 *   cantidadActiva:  number,
 *   totalHistorico:  number,
 *   nombreUsuario:   string,
 * }} props
 */
export default function ModalReporteExito({
  onClose,
  cantidadActiva,
  totalHistorico,
  nombreUsuario,
}) {
  const primerNombre = nombreUsuario?.split(' ')[0] ?? 'viajero'

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exito-titulo"
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex:         900,
        display:        'flex',
        alignItems:     'flex-end',
        justifyContent: 'center',
        padding:        '0 0 80px',
        animation:      'fadeIn 0.2s ease',
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
          padding:      '24px 24px 32px',
          boxShadow:    '0 -8px 40px rgba(0,0,0,0.15)',
          animation:    'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
          fontFamily:   "'Plus Jakarta Sans', sans-serif",
          textAlign:    'center',
        }}
      >
        {/* Cerrar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 8 }}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Emoji / ilustración */}
        <div style={{
          width:          72,
          height:         72,
          borderRadius:   '50%',
          background:     'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '2.25rem',
          marginBottom:   16,
        }}>
          🎉
        </div>

        <h2
          id="exito-titulo"
          style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}
        >
          ¡Gracias, {primerNombre}!
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
          Tu reporte ya está ayudando a otros usuarios de TransBus en Trujillo.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {/* Reportes activos ahora */}
          <div style={{
            background:   '#e8f0fd',
            borderRadius: 14,
            padding:      '14px 12px',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '1.75rem', fontWeight: 800, color: '#1d6fe8', lineHeight: 1 }}>
              {cantidadActiva}
            </p>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: '#1d6fe8', fontWeight: 600, lineHeight: 1.3 }}>
              reportes activos ahora en esta ruta
            </p>
          </div>

          {/* Contribución histórica */}
          <div style={{
            background:   '#f0fdf4',
            borderRadius: 14,
            padding:      '14px 12px',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '1.75rem', fontWeight: 800, color: '#15803d', lineHeight: 1 }}>
              #{totalHistorico}
            </p>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: '#15803d', fontWeight: 600, lineHeight: 1.3 }}>
              reporte histórico en esta ruta
            </p>
          </div>
        </div>

        {/* Mensaje de comunidad */}
        <div style={{
          background:   '#f8fafc',
          borderRadius: 12,
          padding:      '12px 14px',
          marginBottom: 20,
          display:      'flex',
          alignItems:   'center',
          gap:          10,
        }}>
          <IconUsers size={18} color="#64748b" stroke={2} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4, textAlign: 'left' }}>
            {cantidadActiva >= 4
              ? `Con ${cantidadActiva} reportes, la estimación de llegada es de alta confianza. 🟢`
              : cantidadActiva >= 2
              ? `Con ${cantidadActiva} reportes tenemos estimación moderada. ¡Sigan reportando! 🟡`
              : `Tú abriste el conteo de esta ruta. Invita a otros a reportar para mejorar la estimación. 🔵`
            }
          </p>
        </div>

        {/* CTA cerrar */}
        <button
          id="btn-exito-cerrar"
          onClick={onClose}
          style={{
            width:          '100%',
            background:     '#1d6fe8',
            color:          '#fff',
            fontFamily:     "'Plus Jakarta Sans', sans-serif",
            fontWeight:     700,
            fontSize:       '0.9375rem',
            padding:        '13px 24px',
            borderRadius:   999,
            border:         'none',
            cursor:         'pointer',
          }}
        >
          Perfecto 👍
        </button>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  )
}
