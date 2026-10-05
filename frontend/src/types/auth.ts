export type RolNombre = 'administrador' | 'responsable' | 'control_social'

export interface Rol {
  id: number
  nombre: RolNombre
  descripcion?: string
}

export interface Unidad {
  id: number
  entidad_id: number
  nombre: string
  responsable?: string
  entidad?: {
    id: number
    nombre: string
  }
}

export interface User {
  id: number
  nombre: string
  email: string
  rol_id: number
  unidad_id?: number | null
  /**
   * El backend devuelve el rol ya resuelto como nombre plano
   * ("administrador"), no como objeto. Ver AuthController::datosUsuario().
   */
  rol?: RolNombre | null
  /** Idem para la unidad: llega como nombre, no como objeto. */
  unidad?: string | null
  activo?: boolean
  [key: string]: unknown
}

export interface LoginRequest {
  email: string
  password: string
  device_name?: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  token?: string
  data?: {
    token: string
    user: User
  }
}

export interface AuthMe {
  success: boolean
  data: User
}
