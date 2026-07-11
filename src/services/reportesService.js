// reportesService.js — Lógica de negocio de reportes en Firestore
// Colección "reportes": { rutaId, timestamp, uid, estado? }
// Colección "contadores": documento por rutaId con campo { total: number }

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const REPORTES_COL       = 'reportes'
const CONTADORES_COL     = 'contadores'
const ULTIMOS_REPORTES_COL = 'ultimosReportes'
const VENTANA_MIN   = 15   // minutos hacia atrás para "reportes activos"
export const COOLDOWN_MIN = 3  // minutos entre reportes del mismo usuario+ruta — debe coincidir con firestore.rules

/* ─────────────────────────────────────────────────────────
   crearReporte
   Añade un documento en "reportes" e incrementa el contador
   histórico en "contadores/{rutaId}" de forma atómica.
───────────────────────────────────────────────────────── */
/**
 * @param {string}      rutaId   p.ej. "b1-nuevo-california"
 * @param {string}      uid      UID de Firebase Auth
 * @param {string|null} estado   "lleno" | "vacio" | "cambio_ruta" | null
 * @returns {Promise<void>}
 */
export async function crearReporte(rutaId, uid, estado = null, lat = null, lng = null) {
  const ahora = serverTimestamp()

  // 1. Nuevo reporte en la colección principal
  await addDoc(collection(db, REPORTES_COL), {
    rutaId,
    uid,
    estado,                // null si el usuario no seleccionó estado
    lat,
    lng,
    timestamp: ahora,
  })

  // 2. Incrementar el contador histórico (crea el doc si no existe)
  const contadorRef = doc(db, CONTADORES_COL, rutaId)
  await setDoc(contadorRef, { total: increment(1) }, { merge: true })

  // 3. Registrar la marca de tiempo del cooldown (firestore.rules la usa para
  //    rechazar el próximo reporte de este uid+rutaId antes de COOLDOWN_MIN)
  const ultimoRef = doc(db, ULTIMOS_REPORTES_COL, `${uid}_${rutaId}`)
  await setDoc(ultimoRef, { uid, rutaId, timestamp: ahora })
}

/* ─────────────────────────────────────────────────────────
   escucharReportesActivos
   Suscripción en tiempo real a reportes de los últimos
   VENTANA_MIN minutos para una ruta dada.
   Devuelve la función unsubscribe para limpiar en useEffect.
───────────────────────────────────────────────────────── */
/**
 * @param {string}   rutaId
 * @param {function} callback   Recibe (Array<{id, rutaId, uid, estado, timestamp}>)
 * @returns {function} unsubscribe
 */
export function escucharReportesActivos(rutaId, callback, onError) {
  const hace15min = Timestamp.fromMillis(Date.now() - VENTANA_MIN * 60 * 1000)

  const q = query(
    collection(db, REPORTES_COL),
    where('rutaId',    '==', rutaId),
    where('timestamp', '>=', hace15min),
    orderBy('timestamp', 'desc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const reportes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(reportes)
    },
    onError ?? ((err) => console.error('[TransBus] escucharReportesActivos:', err.code, err.message)),
  )
}

/* ─────────────────────────────────────────────────────────
   obtenerTotalHistorico
   Lee el contador precalculado del documento
   "contadores/{rutaId}". Mucho más eficiente que contar
   todos los documentos de "reportes".
───────────────────────────────────────────────────────── */
/**
 * @param {string} rutaId
 * @returns {Promise<number>} total acumulado (0 si no existe aún)
 */
export async function obtenerTotalHistorico(rutaId) {
  const ref  = doc(db, CONTADORES_COL, rutaId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data().total ?? 0) : 0
}

/* ─────────────────────────────────────────────────────────
   escucharReportesUsuario
   Suscripción en tiempo real a TODOS los reportes de un
   usuario concreto (por uid), ordenados del más nuevo al
   más antiguo. Ideal para el perfil del usuario.
   Nota: requiere índice compuesto en Firestore:
     colección "reportes" → uid ASC + timestamp DESC
   (Firestore te da el enlace directo para crearlo la 1ª vez)
───────────────────────────────────────────────────────── */
/**
 * @param {string}   uid
 * @param {function} callback  Recibe (Array<{id, rutaId, uid, estado, timestamp}>)
 * @returns {function} unsubscribe
 */
export function escucharReportesUsuario(uid, callback, onError) {
  const q = query(
    collection(db, REPORTES_COL),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const reportes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(reportes)
    },
    onError ?? ((err) => console.error('[TransBus] escucharReportesUsuario:', err.code, err.message)),
  )
}
