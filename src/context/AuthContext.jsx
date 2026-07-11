import { useEffect, useState } from 'react'
import { signInWithGoogle, signOut, onAuthChanged } from '@/services/authService'
import { AuthContext } from '@/hooks/useAuth'

/* ── Provider ──────────────────────────────────────────── */
/**
 * AuthProvider — envuelve la app y expone el estado de auth.
 * Colócalo en App.jsx por encima del router.
 */
export function AuthProvider({ children }) {
  const [usuario,  setUsuario]  = useState(null)
  const [cargando, setCargando] = useState(true)  // true hasta que Firebase responda

  // Suscripción al estado de auth al montar; se limpia al desmontar
  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      setUsuario(user)
      setCargando(false)
    })
    return unsubscribe
  }, [])

  /**
   * Inicia sesión con Google. Propaga el error si el popup es cancelado
   * o bloqueado, para que el llamador pueda manejarlo.
   */
  async function login() {
    try {
      await signInWithGoogle()
      // onAuthChanged actualizará `usuario` automáticamente
    } catch (err) {
      // Ignorar cancelación del popup (auth/popup-closed-by-user)
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('[AuthContext] Error en login:', err)
        throw err
      }
    }
  }

  /** Cierra sesión. */
  async function logout() {
    await signOut()
    // onAuthChanged pondrá usuario = null
  }

  const value = { usuario, cargando, login, logout }

  // No renderiza hijos hasta que Firebase confirme el estado inicial
  // (evita flicker de pantalla de login en recarga con sesión activa)
  if (cargando) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        height:         '100dvh',
        fontFamily:     "'Plus Jakarta Sans', sans-serif",
        color:          '#94a3b8',
        fontSize:       '0.875rem',
      }}>
        Cargando…
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
