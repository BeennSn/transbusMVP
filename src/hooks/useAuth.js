import { createContext, useContext } from 'react'

// Vive aquí (no en AuthContext.jsx) para que ese archivo exporte solo el
// componente Provider — Fast Refresh no funciona si un archivo de componente
// también exporta un context u otro valor no-componente.
export const AuthContext = createContext(null)

/**
 * useAuth — accede al contexto de autenticación desde cualquier componente.
 * Lanza error si se usa fuera del AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
