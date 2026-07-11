import { useRef, useState, useEffect } from 'react'
import { UbicacionContext } from '@/hooks/useUbicacion'

/**
 * UbicacionProvider — gestiona la geolocalización GPS a nivel de app.
 *
 * El watcher se inicia UNA sola vez cuando el usuario toca "Activar" y
 * sobrevive a la navegación entre páginas. Al recargar la página, si el
 * navegador ya tiene permiso concedido, se auto-activa sin mostrar el banner.
 */
export function UbicacionProvider({ children }) {
  const [ubicacion,       setUbicacion]       = useState(null)
  const [permisoPedido,   setPermisoPedido]   = useState(false)
  const [permisoDenegado, setPermisoDenegado] = useState(false)
  const [cargando,        setCargando]        = useState(false)

  const watchIdRef = useRef(null)

  function _iniciarWatcher() {
    if (watchIdRef.current !== null) return // ya está corriendo
    if (!navigator.geolocation) {
      setPermisoPedido(true)
      setPermisoDenegado(true)
      return
    }

    setPermisoPedido(true)
    setCargando(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUbicacion([pos.coords.latitude, pos.coords.longitude])
        setCargando(false)
        setPermisoDenegado(false)
      },
      (err) => {
        setCargando(false)
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setPermisoDenegado(true)
        }
        // TIMEOUT / UNAVAILABLE → no marcamos como denegado,
        // el usuario puede intentar de nuevo.
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  /** Llamar desde el botón "Activar ubicación" del banner */
  function solicitarUbicacion() {
    _iniciarWatcher()
  }

  // ── Auto-activar si el navegador ya tiene permiso concedido ──
  // Así al recargar la página no vuelve a pedir ni a mostrar el banner.
  useEffect(() => {
    if (!navigator.permissions) return
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        // Permiso ya concedido → arranca el watcher silenciosamente
        _iniciarWatcher()
      }
      // Si es 'prompt' o 'denied' → esperamos que el usuario toque "Activar"
    }).catch(() => {
      // API de permisos no disponible → comportamiento normal
    })
  }, [])

  // Limpiar el watcher al desmontar el árbol (cierre de la app)
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return (
    <UbicacionContext.Provider value={{
      ubicacion,
      permisoPedido,
      permisoDenegado,
      cargando,
      solicitarUbicacion,
    }}>
      {children}
    </UbicacionContext.Provider>
  )
}

