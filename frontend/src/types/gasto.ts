export interface Gasto {
  id: number
  actividad_id: number
  proveedor_id?: number | null
  fecha: string
  monto: number
  detalle?: string | null
  proveedor?: { id: number; nombre: string; nit?: string | null }
  actividad?: { id: number; objetivo: string }
  created_at?: string
  updated_at?: string
}

export interface GastoFormData {
  actividad_id: number
  proveedor_id?: number | null
  fecha: string
  monto: number
  detalle?: string | null
}
