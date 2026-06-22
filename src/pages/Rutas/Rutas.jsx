import { useState } from 'react'
import { getRutas } from '@/services/rutasService'
import RutaCard from '@/components/rutas/RutaCard'
import { IconBus, IconSearch, IconX } from '@tabler/icons-react'

const TODAS_LAS_RUTAS = getRutas()

export default function Rutas() {
  const [busqueda, setBusqueda] = useState('')

  const rutasFiltradas = busqueda.trim() === ''
    ? TODAS_LAS_RUTAS
    : TODAS_LAS_RUTAS.filter((r) => {
        const q = busqueda.toLowerCase()
        return (
          r.codigo?.toLowerCase().includes(q)   ||
          r.nombre?.toLowerCase().includes(q)   ||
          r.operador?.toLowerCase().includes(q) ||
          r.sirveA?.some(s => s.toLowerCase().includes(q))
        )
      })

  return (
    <main className="page-container" style={{ background: '#f5f7fa' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        background:   '#ffffff',
        padding:      '20px 16px 0',
        borderBottom: '1px solid #e2e8f0',
        position:     'sticky',
        top:          0,
        zIndex:       10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
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
              {TODAS_LAS_RUTAS.length} rutas disponibles · cerca de universidades de Trujillo
            </p>
          </div>
        </div>

        {/* ── Buscador ──────────────────────────────────── */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          background:   '#f8fafc',
          border:       '1.5px solid #e2e8f0',
          borderRadius: 12,
          padding:      '9px 12px',
          marginBottom: 12,
        }}>
          <IconSearch size={16} color="#94a3b8" stroke={2} style={{ flexShrink: 0 }} />
          <input
            id="buscador-rutas"
            type="search"
            placeholder="Buscar por código, nombre o universidad…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              flex:       1,
              border:     'none',
              background: 'transparent',
              outline:    'none',
              fontSize:   '0.875rem',
              color:      '#0f172a',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8', display: 'flex' }}
            >
              <IconX size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ── Lista de rutas ─────────────────────────────── */}
      <section
        id="lista-rutas"
        style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {rutasFiltradas.length > 0
          ? rutasFiltradas.map((ruta) => (
              <RutaCard key={ruta.id} ruta={ruta} />
            ))
          : (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: '#94a3b8', fontSize: '0.875rem',
              }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</p>
                <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>Sin resultados</p>
                <p style={{ margin: '4px 0 0' }}>
                  Intenta con otro código o nombre de universidad
                </p>
              </div>
            )}
      </section>

    </main>
  )
}
