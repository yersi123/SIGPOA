export type EstadoGestion = 'abierta' | 'cerrada'

export interface Gestion {
  id: number
  anio: number
  estado: EstadoGestion
  fecha_apertura?: string | null
  fecha_cierre?: string | null
  created_at?: string
  updated_at?: string
}

export interface GestionFormData {
  anio: number
  estado?: EstadoGestion
  fecha_apertura?: string | null
  fecha_cierre?: string | null
}
