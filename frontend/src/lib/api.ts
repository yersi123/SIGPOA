import axios from 'axios'
import { toast } from 'sonner'

import { EVENTO_SESION_EXPIRADA } from '@/stores/auth.constants'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalToast?: boolean
  }
}

// Permite que un request silencie los toasts globales del interceptor cuando
// la pantalla que lo dispara ya pinta el error (campo o alerta del formulario).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8123/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

let isRedirectingToLogin = false

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const sinToastGlobal = Boolean(error?.config?.skipGlobalToast)

    if (status === 401) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        // Se avisa con un evento en vez de importar el store: auth.store.ts ya
        // importa este modulo y hacerlo al reves cerraria un ciclo. El store es
        // quien limpia el estado y decide el mensaje, con la caducidad a la vista.
        window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA))
        toast.error('Tu sesión no es válida o ha vencido. Vuelve a iniciar sesión.')
        // Se libera despues del salto de ruta para que varias respuestas 401
        // seguidas (consultas en paralelo) no disparen avisos duplicados.
        setTimeout(() => {
          isRedirectingToLogin = false
        }, 2000)
      }
      return Promise.reject(error)
    }

    if (status === 403 && !sinToastGlobal) {
      toast.error(data?.message || 'No tienes permiso para realizar esta acción')
      return Promise.reject(error)
    }

    if (status === 404 && !sinToastGlobal) {
      toast.warning(data?.message || 'Recurso no encontrado')
      return Promise.reject(error)
    }

    if (status === 409 && !sinToastGlobal) {
      toast.error(data?.message || 'Conflicto con el estado del recurso')
      return Promise.reject(error)
    }

    if (status === 422 && !sinToastGlobal) {
      const message = data?.message || 'Error de validación'
      toast.error(message)
      return Promise.reject(error)
    }

    if (status === 429 && !sinToastGlobal) {
      toast.warning('Demasiados intentos. Espera un minuto antes de volver a intentarlo.')
      return Promise.reject(error)
    }

    if (status === 500 && !sinToastGlobal) {
      toast.error('Ocurrió un error interno. Inténtalo más tarde.')
      return Promise.reject(error)
    }

    if (sinToastGlobal) return Promise.reject(error)

    const message = data?.message || error?.message || 'Error inesperado'
    toast.error(message)
    return Promise.reject(error)
  }
)

export default api
