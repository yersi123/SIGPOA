import { useEffect, useState } from 'react'

import { useAuthStore } from '@/stores/auth.store'

/**
 * Milisegundos que le quedan al token, o null si se desconoce la caducidad.
 *
 * Vive en un archivo propio, y no junto al componente que avisa, para no
 * mezclar exportaciones de componente y de hook en el mismo modulo.
 *
 * El intervalo solo actualiza `ahora`; el resto se calcula durante el render.
 * Asi el valor no depende de `Date.now()` dentro del render, que es una
 * impureza y produce lecturas inestables entre renders.
 */
export function useSesionRestante(): number | null {
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)

  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(Date.now()), 30_000)
    return () => window.clearInterval(temporizador)
  }, [])

  if (!token || !expiresAt) return null

  const limite = new Date(expiresAt).getTime()
  if (Number.isNaN(limite)) return null

  return Math.max(0, limite - ahora)
}

/** Hora local a la que caduca el token, o null si se desconoce. */
export function useHoraCaducidad(): string | null {
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)

  if (!token || !expiresAt) return null

  const limite = new Date(expiresAt)
  if (Number.isNaN(limite.getTime())) return null

  return limite.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}