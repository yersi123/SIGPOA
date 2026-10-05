import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useAuthStore } from '@/stores/auth.store'

/** Minutos restantes a partir de los cuales se empieza a avisar. */
const AVISO_CORTO = 5
const AVISO_CRITICO = 1

/**
 * Avisa de la caducidad de la sesión y la cierra al llegar.
 *
 * El backend ya devuelve `expires_at` en el login, pero antes de este
 * componente ese dato se ignoraba: el token caducaba en silencio y el usuario
 * se enteraba cuando la siguiente petición salía con un 401, normalmente a
 * mitad de un formulario. Aquí se avisa con antelación y se cierra la sesión
 * sola, para que nunca se pierda trabajo por sorpresa.
 */
export function SessionExpiryNotice() {
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const expirar = useAuthStore((state) => state.expirar)

  // Nivel de aviso ya mostrado, para no repetir el mismo toast cada segundo.
  const avisadoEn = useRef<number | null>(null)

  useEffect(() => {
    if (!token || !expiresAt) return

    const limite = new Date(expiresAt).getTime()
    if (Number.isNaN(limite)) return

    // El aviso se dispara al cruzar el umbral, no en cada tick.
    const temporizador = window.setInterval(() => {
      const minutos = (limite - Date.now()) / 60_000

      if (minutos <= 0) {
        window.clearInterval(temporizador)
        avisadoEn.current = null
        expirar()
        toast.error('Tu sesión expiró. Vuelve a iniciar sesión para continuar.')
        return
      }

      if (minutos <= AVISO_CRITICO) {
        if (avisadoEn.current !== AVISO_CRITICO) {
          avisadoEn.current = AVISO_CRITICO
          toast.warning('Tu sesión expira en menos de 1 minuto.')
        }
      } else if (minutos <= AVISO_CORTO) {
        if (avisadoEn.current !== AVISO_CORTO) {
          avisadoEn.current = AVISO_CORTO
          toast.warning(`Tu sesión expira en ${Math.ceil(minutos)} minutos.`)
        }
      }
    }, 1000)

    return () => window.clearInterval(temporizador)
  }, [token, expiresAt, expirar])

  // No pinta nada: su trabajo es el temporizador y los avisos. El contador
  // visible lo lee el Header con useSesionRestante.
  return null
}