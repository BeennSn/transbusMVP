import data from '@/data/paraderos.json'
import ParaderoCard from '@/components/paraderos/ParaderoCard'
import { IconMapPin, IconShieldFilled } from '@tabler/icons-react'

const { paraderos } = data

/* Ordena de mayor a menor nivel de seguridad */
const paraderosSeguros = [...paraderos].sort(
  (a, b) => b.nivelSeguridad - a.nivelSeguridad
)

export default function Paraderos() {
  return (
    <main className="page-container" style={{ background: '#f5f7fa' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        background:   '#ffffff',
        padding:      '20px 16px 16px',
        borderBottom: '1px solid #e2e8f0',
        position:     'sticky',
        top:          0,
        zIndex:       10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     '#dcfce7',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}>
            <IconMapPin size={20} color="#15803d" stroke={2} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              Paraderos
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              {paraderosSeguros.length} paraderos verificados por la comunidad
            </p>
          </div>
        </div>
      </header>

      {/* ── Leyenda de seguridad ────────────────────────── */}
      <div style={{
        margin:       '14px 16px 0',
        background:   '#f0fdf4',
        borderRadius: 12,
        padding:      '10px 14px',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
      }}>
        <IconShieldFilled size={18} color="#15803d" />
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#15803d', fontWeight: 600, lineHeight: 1.4 }}>
          Los paraderos están ordenados de más a menos seguros, según reportes de usuarios.
        </p>
      </div>

      {/* ── Lista de paraderos ─────────────────────────── */}
      <section
        id="lista-paraderos"
        style={{ padding: '14px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {paraderosSeguros.map((paradero) => (
          <ParaderoCard key={paradero.id} paradero={paradero} />
        ))}
      </section>

    </main>
  )
}
