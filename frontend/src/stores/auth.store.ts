import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import api from '@/lib/api'
import { EVENTO_SESION_EXPIRADA } from '@/stores/auth.constants'
import type { User } from '@/types/auth'

type Capa = Record<string, unknown> | null | undefined

/**
 * Lee un campo de forma segura sin mezclar ?? con && ni con el ternario.
 * Devuelve {} cuando la capa no es un objeto, para que siempre se pueda
 * indexar sin comprobar null en cada acceso.
 */
function capa(valor: Capa): Record<string, unknown> {
  return typeof valor === 'object' && valor !== null ? valor : {}
}

/**
 * Extrae el token limpio de la respuesta del login.
 *
 * Acepta las variantes que devuelve la API (token, access_token,
 * plainTextToken, anidadas bajo data) y quita el prefijo "Bearer " una sola
 * vez, sin dejar nunca undefined ni "undefined" como token.
 */
function extraerToken(res: unknown): string | null {
  const raiz = capa(res as Capa)
  const data = capa(raiz['data'] as Capa)
  const dataData = capa(data['data'] as Capa)

  const bruto =
    raiz['token'] ??
    raiz['access_token'] ??
    raiz['plainTextToken'] ??
    data['token'] ??
    data['access_token'] ??
    data['plainTextToken'] ??
    dataData['token'] ??
    dataData['access_token'] ??
    dataData['plainTextToken'] ??
    null

  if (typeof bruto !== 'string') {
    return null
  }

  const limpio = bruto.replace(/^Bearer\s+/i, '').trim()

  return limpio === '' ? null : limpio
}

/**
 * Extrae el usuario de la respuesta del login.
 * El backend de SIGPOA lo devuelve como "usuario" dentro de "data".
 */
function extraerUsuario(res: unknown): User | null {
  const raiz = capa(res as Capa)
  const data = capa(raiz['data'] as Capa)
  const dataData = capa(data['data'] as Capa)

  const usuario =
    raiz['user'] ??
    raiz['usuario'] ??
    data['user'] ??
    data['usuario'] ??
    dataData['user'] ??
    dataData['usuario'] ??
    null

  return (usuario as User | null) ?? null
}

/**
 * Lee el instante de caducidad que el login ya devuelve en `expires_at`.
 *
 * Importa porque el store decide cuando avisar y cuando cerrar la sesion: si
 * el token caduca sin previo aviso, el usuario se queda a media tarea y solo
 * se entera cuando la siguiente peticion le devuelve un 401.
 */
function extraerCaducidad(res: unknown): string | null {
  const raiz = capa(res as Capa)
  const data = capa(raiz['data'] as Capa)
  const dataData = capa(data['data'] as Capa)

  const bruto =
    raiz['expires_at'] ??
    raiz['expiresAt'] ??
    data['expires_at'] ??
    data['expiresAt'] ??
    dataData['expires_at'] ??
    dataData['expiresAt'] ??
    null

  if (typeof bruto !== 'string') {
    return null
  }

  const fecha = new Date(bruto)

  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString()
}

interface AuthState {
  user: User | null
  token: string | null
  /** ISO8601. La devuelve el login; se persiste para sobreviver al refresh. */
  expiresAt: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  /** Queda en true cuando la sesion caduca para que el login lo explique. */
  sesionExpirada: boolean
  error: string | null
  setToken: (token: string | null) => void
  loadMe: () => Promise<void>
  login: (email: string, password: string, device_name?: string) => Promise<void>
  logout: () => Promise<void>
  clear: () => void
  /** Cierra la sesion avisando de que venció, sin llamar a la API. */
  expirar: () => void
  /** Milisegundos que quedan; null si no hay caducidad conocida. */
  restanteMs: () => number | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true,
      sesionExpirada: false,
      error: null,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
      },

      clear: () => {
        // Hay que borrar tambien la clave que usa persist: si no, al recargar
        // la pagina Zustand rehidrata el token, isAuthenticated queda en true y
        // api.ts ya no encuentra 'auth-token', por lo que toda peticion sale
        // sin cabecera y el backend responde 401.
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-storage')
        set({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
          isInitializing: false,
          error: null,
        })
      },

      expirar: () => {
        // No se llama a /auth/logout: el token ya esta vencido y el backend solo
        // lo borraria de su tabla. Aqui basta con limpiar el estado local.
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-storage')
        set({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
          isInitializing: false,
          sesionExpirada: true,
          error: null,
        })
      },

      restanteMs: () => {
        const { expiresAt } = get()
        if (!expiresAt) return null
        const ms = new Date(expiresAt).getTime() - Date.now()
        return ms
      },

      loadMe: async () => {
        const token = get().token
        if (!token) {
          set({
            isInitializing: false,
            isAuthenticated: false,
            user: null,
            sesionExpirada: false,
          })
          return
        }
        try {
          set({ isLoading: true, error: null })
          const response = await api.get('/auth/me')
          const user = response.data?.data ?? response.data?.user ?? response.data
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitializing: false,
            sesionExpirada: false,
          })
        } catch (error: any) {
          const status = error?.response?.status

          // Un corte de red o un 500 no significa que la sesion haya caducado:
          // cerrar la en esos casos deja al usuario fuera sin que pueda hacer
          // nada. Solo se limpia cuando la API dice que el token no vale.
          if (status === 401 || status === 403) {
            localStorage.removeItem('auth-token')
            localStorage.removeItem('auth-storage')
            set({
              user: null,
              token: null,
              expiresAt: null,
              isAuthenticated: false,
              isLoading: false,
              isInitializing: false,
              sesionExpirada: true,
              error: null,
            })
            return
          }

          // Error transitorio: se mantiene el token y se avisa, para que un
          // reintento del usuario recupere la sesion sin volver a entrar.
          set({
            user: null,
            isLoading: false,
            isInitializing: false,
            error: 'No se pudo verificar la sesión. Revisa tu conexión.',
          })
        }
      },

      login: async (email, password, device_name = 'frontend-web') => {
        try {
          set({ isLoading: true, error: null })
          const response = await api.post('/auth/login', {
            email,
            password,
            device_name,
          })
          const res = response.data

          const token = extraerToken(res)
          const user = extraerUsuario(res)
          const expiresAt = extraerCaducidad(res)

          if (!token) {
            throw new Error('El servidor no devolvió un token')
          }

          localStorage.setItem('auth-token', token)
          set({
            token,
            user,
            expiresAt,
            isAuthenticated: true,
            isLoading: false,
            isInitializing: false,
            sesionExpirada: false,
            error: null,
          })

          // Si el login no trajo el usuario, se pide aparte. El arranque de la
          // aplicacion tambien pasa por aqui: ver AuthBootstrap.
          if (!user) {
            await get().loadMe()
          }
        } catch (error: any) {
          const message =
            error?.response?.data?.message || error?.message || 'Error al iniciar sesión'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          const token = get().token
          if (token) {
            await api.post('/auth/logout')
          }
        } catch (error) {
          // Si la revocacion falla el token se limpia igualmente en el finally:
          // dejarlo en localStorage seria peor que un 401 en el proximo login.
          console.error('Error during logout:', error)
        } finally {
          get().clear()
          window.location.href = '/'
        }
      },
    }),
    {
      name: 'auth-storage',
      // El usuario NO se persiste a proposito: el rol debe venir del servidor
      // en cada arranque. Si se guardara y luego un administrador bajara los
      // permisos de esta persona, la interfaz seguiria mostrando botones que el
      // backend ya no va a permitir.
      partialize: (state) => ({ token: state.token, expiresAt: state.expiresAt }),
    },
  ),
)

/**
 * El interceptor de axios no puede tocar el store (import ciclo), asi que
 * avisa con este evento y el store decide que hacer. Se registra a nivel de
 * modulo para que escuche desde el primer momento, tambien en la ruta /login.
 */
if (typeof window !== 'undefined') {
  window.addEventListener(EVENTO_SESION_EXPIRADA, () => {
    const { isAuthenticated, sesionExpirada } = useAuthStore.getState()
    if (!isAuthenticated || sesionExpirada) return
    useAuthStore.getState().expirar()
  })
}