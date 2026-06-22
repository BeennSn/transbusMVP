import { AuthProvider }     from '@/context/AuthContext'
import { UbicacionProvider } from '@/context/UbicacionContext'
import AppRouter             from '@/router/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <UbicacionProvider>
        <AppRouter />
      </UbicacionProvider>
    </AuthProvider>
  )
}
