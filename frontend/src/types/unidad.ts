export interface Unidad {
  id: number
  entidad_id: number
  nombre: string
  responsable?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface UnidadFormData {
  entidad_id: number
  nombre: string
  responsable?: string | null
}

export interface UnidadFormValues {
  entidad_id: string
  nombre: string
  responsable: string
}

/**
 * El nombre de la entidad no viene anidado.
 *
 * UnidadResource solo expone entidad_id, asi que el listado y el detalle
 * resuelven el nombre con una consulta aparte a /entidades y lo cruzan por id.
 */
export interface UnidadConEntidad extends Unidad {
  entidadNombre?: string
}