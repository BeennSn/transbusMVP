import { createContext, useContext } from 'react'

// Vive aquí (no en UbicacionContext.jsx) para que ese archivo exporte solo el
// componente Provider — Fast Refresh no funciona si un archivo de componente
// también exporta un context u otro valor no-componente.
export const UbicacionContext = createContext(null)

/** Hook de consumo del contexto de geolocalización. */
export function useUbicacion() {
  const ctx = useContext(UbicacionContext)
  if (!ctx) throw new Error('useUbicacion debe usarse dentro de UbicacionProvider')
  return ctx
}
