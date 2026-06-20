import { useState, useEffect, useRef } from 'react'

/**
 * useUbicacionUsuario — expone la ubicación GPS del usuario via watchPosition.
 *
 * El permiso NO se pide automáticamente al montar; se activa manualmente
 * llamando a solicitarUbicacion() (botón "Activar ubicación").
 *
 * @returns {{
 *   ubicacion:        [number, number] | null,
 *   permisoPedido:    boolean,
 *   permisoDenegado:  boolean,
 *   cargando:         boolean,
 *   solicitarUbicacion: () => void,
 * }}
 */
export default function useUbicacionUsuario() {
  const [ubicacion,        setUbicacion]        = useState(null)
  const [permisoPedido,    setPermisoPedido]    = useState(false)
  const [permisoDenegado,  setPermisoDenegado]  = useState(false)
  const [cargando,         setCargando]         = useState(false)

  // Guardamos el watchId en un ref para poder limpiar al desmontar
  const watchIdRef = useRef(null)

  /**
   * Inicia watchPosition. Solo debe llamarse una vez desde el UI
   * (botón "Activar ubicación"). Si el navegador no tiene geolocation
   * lo marcamos como denegado.
   */
  function solicitarUbicacion() {
    if (!navigator.geolocation) {
      setPermisoPedido(true)
      setPermisoDenegado(true)
      return
    }

    setPermisoPedido(true)
    setCargando(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      // ── Éxito ──────────────────────────────────────────────
      (pos) => {
        setUbicacion([pos.coords.latitude, pos.coords.longitude])
        setCargando(false)
        setPermisoDenegado(false)
      },
      // ── Error ───────────────────────────────────────────────
      (err) => {
        setCargando(false)
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setPermisoDenegado(true)
        }
        // TIMEOUT o POSITION_UNAVAILABLE → dejamos cargando=false,
        // el usuario puede ver el aviso discreto.
      },
      {
        enableHighAccuracy: true,
        timeout:            15000,
        maximumAge:         0,
      }
    )
  }

  // Limpia el watcher al desmontar el componente que use este hook
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    ubicacion,
    permisoPedido,
    permisoDenegado,
    cargando,
    solicitarUbicacion,
  }
}
