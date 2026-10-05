import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { useAuthStore } from '@/stores/auth.store'

/**
 * Repuebla el usuario al arrancar la aplicacion.
 *
 * Sin esto, un F5 deja la sesion a medias: `partialize` persiste el token pero
 * no el usuario, y nadie volvia a pedirlo. El resultado era que el rol se
 * quedaba en null, `usePermisos` devolvia todos los flags a false y el Sidebar
 * se quedaba solo con los enlaces sin filtro de rol (los reportes). Es el
 * sintoma de "se me cambio a modo usuario".
 *
 * Se llama una unica vez. El ref es obligatorio: main.tsx monta <StrictMode> y
 * en desarrollo los efectos se ejecutan dos veces, lo que dispararia dos
 * peticiones a /auth/me.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const loadMe = useAuthStore((state) => state.loadMe)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    // Se llama siempre, incluso sin token: loadMe resuelve la rama de "no hay
    // token" poniendo isInitializing en false, que es lo que evita que el
    // formulario de login se quede detrás del estado de carga.
    void loadMe()
  }, [loadMe])

  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verificando sesión…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}