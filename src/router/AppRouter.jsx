import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BottomNav  from '@/components/common/BottomNav'
import Mapa       from '@/pages/Mapa/Mapa'
import Rutas      from '@/pages/Rutas/Rutas'
import Paraderos  from '@/pages/Paraderos/Paraderos'
import Perfil     from '@/pages/Perfil/Perfil'
import Bienvenida from '@/pages/Bienvenida/Bienvenida'

/** Si el usuario ya vio la bienvenida, va directo al mapa */
const yaVio = localStorage.getItem('transbus_bienvenida_vista') === '1'

/** BottomNav oculto en la pantalla de bienvenida (path "/") */
function BottomNavCondicional() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return <BottomNav />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Raíz: bienvenida la primera vez, mapa a partir de la segunda */}
        <Route
          path="/"
          element={yaVio ? <Navigate to="/mapa" replace /> : <Bienvenida />}
        />

        <Route path="/mapa"      element={<Mapa />}      />
        <Route path="/rutas"     element={<Rutas />}     />
        <Route path="/paraderos" element={<Paraderos />} />
        <Route path="/perfil"    element={<Perfil />}    />
      </Routes>

      {/* BottomNav solo en páginas interiores */}
      <BottomNavCondicional />
    </BrowserRouter>
  )
}
