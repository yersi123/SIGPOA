export interface Proveedor {
  id: number
  nombre: string
  nit?: string | null
  telefono?: string | null
  direccion?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProveedorFormData {
  nombre: string
  nit?: string | null
  telefono?: string | null
  direccion?: string | null
}

export interface ProveedorFormValues {
  nombre: string
  nit: string
  telefono: string
  direccion: string
}