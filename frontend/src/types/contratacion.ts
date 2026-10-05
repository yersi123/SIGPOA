export type EstadoContratacion = 'solicitud' | 'cotizacion' | 'adjudicada'

export interface Contratacion {
  id: number
  actividad_id: number
  proveedor_id: number
  descripcion?: string | null
  monto_cotizado?: number | null
  estado: EstadoContratacion
  fecha: string
  fecha_cotizacion?: string | null
  fecha_adjudicacion?: string | null
  actividad?: { id: number; objetivo: string }
  proveedor?: { id: number; nombre: string; nit?: string | null }
  created_at?: string
  updated_at?: string
}

export interface ContratacionFormData {
  actividad_id: number
  proveedor_id: number
  descripcion?: string | null
  monto_cotizado?: number | null
  estado?: EstadoContratacion
  fecha: string
  fecha_cotizacion?: string | null
  fecha_adjudicacion?: string | null
}
