import { IconShieldFilled, IconClock } from '@tabler/icons-react'

/* ── Configuración visual por nivel de seguridad ─────── */
const SEGURIDAD_CONFIG = {
  5: { color: '#15803d', bg: '#dcfce7', label: 'Muy seguro',      stars: 5 },
  4: { color: '#16a34a', bg: '#f0fdf4', label: 'Seguro',          stars: 4 },
  3: { color: '#d97706', bg: '#fef3c7', label: 'Moderado',        stars: 3 },
  2: { color: '#dc2626', bg: '#fef2f2', label: 'Con precaución',  stars: 2 },
  1: { color: '#991b1b', bg: '#fef2f2', label: 'Evitar de noche', stars: 1 },
}

function ShieldBadge({ nivel }) {
  const cfg = SEGURIDAD_CONFIG[nivel] ?? SEGURIDAD_CONFIG[3]
  return (
    <div style={{
      display:        'inline-flex',
      alignItems:     'center',
      gap:            5,
      background:     cfg.bg,
      color:          cfg.color,
      borderRadius:   999,
      padding:        '5px 12px',
      fontSize:       '0.75rem',
      fontWeight:     700,
      whiteSpace:     'nowrap',
    }}>
      <IconShieldFilled size={14} />
      {cfg.label}
    </div>
  )
}

function NivelDots({ nivel }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const cfg = SEGURIDAD_CONFIG[nivel] ?? SEGURIDAD_CONFIG[3]
        return (
          <div
            key={n}
            style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   n <= nivel ? cfg.color : '#e2e8f0',
              transition:   'background 0.2s',
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * ParaderoCard — tarjeta de paradero con indicador de seguridad.
 * @param {{ paradero: Object }} props
 */
export default function ParaderoCard({ paradero }) {
  const cfg = SEGURIDAD_CONFIG[paradero.nivelSeguridad] ?? SEGURIDAD_CONFIG[3]

  return (
    <article
      id={`paradero-${paradero.id}`}
      style={{
        background:   '#ffffff',
        borderRadius: 16,
        border:       '1px solid #e2e8f0',
        padding:      '16px',
        boxShadow:    '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Fila 1: nombre + badge seguridad */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <h2 style={{
          margin:     0,
          fontSize:   '0.9375rem',
          fontWeight: 700,
          color:      '#0f172a',
          lineHeight: 1.3,
          flex:       1,
        }}>
          {paradero.nombre}
        </h2>
        <ShieldBadge nivel={paradero.nivelSeguridad} />
      </div>

      {/* Referencia */}
      <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
        📍 {paradero.referencia}
      </p>

      {/* Dots de nivel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <NivelDots nivel={paradero.nivelSeguridad} />
        <span style={{ fontSize: '0.6875rem', color: cfg.color, fontWeight: 600 }}>
          Nivel {paradero.nivelSeguridad}/5
        </span>
      </div>

      {/* Notas */}
      <p style={{
        margin:       '0 0 12px',
        fontSize:     '0.8125rem',
        color:        '#334155',
        lineHeight:   1.5,
        background:   '#f8fafc',
        borderRadius: 8,
        padding:      '8px 10px',
        borderLeft:   `3px solid ${cfg.color}`,
      }}>
        {paradero.notas}
      </p>

      {/* Fila inferior: rutas + horario pico */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        {/* Chips de rutas */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {paradero.rutas.map((cod) => (
            <span key={cod} style={{
              background:   cod === 'B1' ? '#e8f0fd' : '#fce7f3',
              color:        cod === 'B1' ? '#1d6fe8' : '#be185d',
              fontWeight:   700,
              fontSize:     '0.6875rem',
              borderRadius: 6,
              padding:      '2px 8px',
            }}>
              {cod}
            </span>
          ))}
        </div>

        {/* Horario pico */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
          <IconClock size={13} stroke={2} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 500 }}>
            Pico: {paradero.horarioPico}
          </span>
        </div>
      </div>
    </article>
  )
}
