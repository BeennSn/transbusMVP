import { useState, useEffect } from 'react'
import { escucharReportesUsuario } from '@/services/reportesService'

/**
 * useReportesUsuario — suscripción en tiempo real a los reportes
 * del usuario autenticado actualmente. Se limpia al desmontar.
 *
 * @param {string|null} uid   UID de Firebase Auth, o null si no hay sesión
 * @returns {{
 *   reportes:      Array,   — todos los reportes del usuario
 *   totalReportes: number,  — cantidad total
 *   estaSemana:    number,  — reportes en los últimos 7 días
 *   cargando:      boolean,
 * }}
 */
export default function useReportesUsuario(uid) {
  const [reportes,  setReportes]  = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    // Sin uid (sin sesión) no suscribimos nada
    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset síncrono al perder sesión, no hay "external system" que sincronizar aquí
      setReportes([])
      setCargando(false)
      setError(null)
      return
    }

    setCargando(true)
    setError(null)

    const unsubscribe = escucharReportesUsuario(
      uid,
      (lista) => {
        setReportes(lista)
        setCargando(false)
        setError(null)
      },
      (err) => {
        console.error('[useReportesUsuario]', err)
        setError('Error al cargar el historial de reportes.')
        setCargando(false)
      }
    )

    return unsubscribe
  }, [uid])

  // Filtro de "esta semana" (últimos 7 días) en el cliente
  // para no necesitar un índice compuesto adicional
  // eslint-disable-next-line react-hooks/purity -- Date.now() se recalcula cada render a propósito, la ventana debe ser siempre "ahora - 7d"
  const hace7dias   = Date.now() - 7 * 24 * 60 * 60 * 1000
  const estaSemana  = reportes.filter((r) => {
    // timestamp puede ser un Timestamp de Firestore o un número
    const ms = r.timestamp?.toMillis?.() ?? r.timestamp ?? 0
    return ms >= hace7dias
  }).length

  return {
    reportes,
    totalReportes: reportes.length,
    estaSemana,
    cargando,
    error,
  }
}
