import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from '@/components/common/BottomNav'
import Mapa from '@/pages/Mapa/Mapa'
import Rutas from '@/pages/Rutas/Rutas'
import Paraderos from '@/pages/Paraderos/Paraderos'
import Perfil from '@/pages/Perfil/Perfil'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige "/" → "/mapa" */}
        <Route path="/" element={<Navigate to="/mapa" replace />} />
        <Route path="/mapa"      element={<Mapa />} />
        <Route path="/rutas"     element={<Rutas />} />
        <Route path="/paraderos" element={<Paraderos />} />
        <Route path="/perfil"    element={<Perfil />} />
      </Routes>

      {/* BottomNav aparece en todas las rutas */}
      <BottomNav />
    </BrowserRouter>
  )
}
