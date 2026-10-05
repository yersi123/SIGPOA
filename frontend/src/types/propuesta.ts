export type EstadoPropuesta = 'propuesto' | 'aprobado' | 'en_ejecucion' | 'concluido'

export interface Propuesta {
  id: number
  organizacion_id: number
  gestion_id: number
  actividad_id?: number | null
  titulo: string
  descripcion?: string | null
  monto_asignado: number
  estado: EstadoPropuesta
  organizacion?: { id: number; nombre: string; tipo: string }
  gestion?: { id: number; anio: number }
  actividad?: { id: number; objetivo: string }
  created_at?: string
  updated_at?: string
}

export interface PropuestaFormData {
  organizacion_id: number
  gestion_id: number
  actividad_id?: number | null
  titulo: string
  descripcion?: string | null
  monto_asignado: number
  estado?: EstadoPropuesta
}

export interface CambiarEstadoPropuestaData {
  estado: EstadoPropuesta
  actividad_id?: number | null
  monto?: number | null
}
