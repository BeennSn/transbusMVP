/**
 * ParadasModal.jsx - Modal para mostrar todas las paradas de un sentido
 */
export default function ParadasModal({ ruta, sentido, isOpen, onClose }) {
  if (!isOpen || !ruta || !sentido) return null

  const paradas = sentido?.paradas || []

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '550px',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b'
            }}>
              {ruta.codigo} - {sentido.nombre}
            </h2>
            <p style={{
              margin: '8px 0 0',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Total de paradas: <strong>{paradas.length}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              color: '#64748b',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#1e293b'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
          >
            ✕
          </button>
        </div>

        {/* Paradas List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {paradas.length > 0 ? (
            paradas.map((parada, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  alignItems: 'flex-start',
                  borderLeft: '3px solid #2563eb',
                  transition: 'all 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f0fe'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc'
                }}
              >
                {/* Orden */}
                <div style={{
                  minWidth: '36px',
                  height: '36px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {parada.orden}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontWeight: '500',
                    color: '#1e293b',
                    fontSize: '0.95rem',
                    wordWrap: 'break-word'
                  }}>
                    {parada.nombre}
                  </p>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    ⏱ {parada.minutosDesdeInicio} min desde el inicio
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{
              textAlign: 'center',
              color: '#94a3b8',
              padding: '24px'
            }}>
              No hay paradas disponibles
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
