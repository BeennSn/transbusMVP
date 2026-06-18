// authService.js — Funciones puras de Firebase Auth
// Separadas del Context para poder testearse de forma independiente
// y reutilizarse desde cualquier parte de la app.

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'

/**
 * Abre el popup de Google y autentica al usuario.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const signInWithGoogle = () =>
  signInWithPopup(auth, googleProvider)

/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<void>}
 */
export const signOut = () => firebaseSignOut(auth)

/**
 * Suscribe un callback a cambios en el estado de autenticación.
 * Devuelve la función de limpieza (unsubscribe).
 * @param {function} callback  Recibe (user | null)
 * @returns {function} unsubscribe
 */
export const onAuthChanged = (callback) =>
  onAuthStateChanged(auth, callback)
