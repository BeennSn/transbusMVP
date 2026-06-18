import { getRutas } from '@/services/rutasService'
import RutaCard from '@/components/rutas/RutaCard'
import { IconBus, IconSearch } from '@tabler/icons-react'

const rutas = getRutas()

export default function Rutas() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     '#e8f0fd',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}>
            <IconBus size={20} color="#1d6fe8" stroke={2} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              Rutas
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              {rutas.length} rutas disponibles en Trujillo
            </p>
          </div>
        </div>
      </header>

      {/* ── Aviso piloto ───────────────────────────────── */}
      <div style={{
        margin:       '14px 16px 0',
        background:   '#e8f0fd',
        borderRadius: 12,
        padding:      '10px 14px',
        display:      'flex',
        alignItems:   'center',
        gap:          8,
      }}>
        <span style={{ fontSize: '1rem' }}>🚧</span>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#1d6fe8', fontWeight: 600, lineHeight: 1.4 }}>
          Piloto inicial — 2 rutas activas. Más rutas próximamente.
        </p>
      </div>

      {/* ── Lista de rutas ─────────────────────────────── */}
      <section
        id="lista-rutas"
        style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {rutas.map((ruta) => (
          <RutaCard key={ruta.id} ruta={ruta} />
        ))}
      </section>

    </main>
  )
}
