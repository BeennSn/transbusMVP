import { useState, useEffect } from 'react'
import { escucharReportesActivos } from '@/services/reportesService'

/**
 * useReportesEnVivo — suscripción en tiempo real a los reportes activos
 * (últimos 15 min) de una ruta. Usa onSnapshot de Firestore internamente.
 *
 * @param {string} rutaId  ID de la ruta, p.ej. "b1-nuevo-california"
 * @returns {{ reportesActivos: Array, cantidadActiva: number, cargando: boolean }}
 */
export default function useReportesEnVivo(rutaId) {
  const [reportesActivos, setReportesActivos] = useState([])
  const [cargando,        setCargando]        = useState(true)

  useEffect(() => {
    if (!rutaId) return

    // Suscripción: se activa al montar y se limpia al desmontar o cambiar rutaId
    const unsubscribe = escucharReportesActivos(rutaId, (reportes) => {
      setReportesActivos(reportes)
      setCargando(false)
    })

    return unsubscribe   // Firestore devuelve directamente la función de limpieza
  }, [rutaId])

  return {
    reportesActivos,
    cantidadActiva: reportesActivos.length,
    cargando,
  }
}
