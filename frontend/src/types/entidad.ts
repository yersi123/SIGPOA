import type { PaginationMeta } from './common'

export const ENTIDAD_TIPOS = [
  'gobernacion',
  'municipio',
  'ministerio',
  'unidad_educativa',
  'otro',
] as const

export type EntidadTipo = (typeof ENTIDAD_TIPOS)[number]

export const ENTIDAD_TIPO_LABELS: Record<EntidadTipo, string> = {
  gobernacion: 'Gobernación',
  municipio: 'Municipio',
  ministerio: 'Ministerio',
  unidad_educativa: 'Unidad Educativa',
  otro: 'Otro',
}

/** Unidad mínima para mostrarla anidada dentro de la entidad. */
export interface EntidadUnidad {
  id: number
  entidad_id: number
  nombre: string
  responsable?: string | null
}

export interface Entidad {
  id: number
  nombre: string
  tipo: EntidadTipo
  departamento: string
  municipio?: string | null
  created_at?: string | null
  updated_at?: string | null
}

/**
 * Respuesta de GET /api/entidades/{id}/unidades.
 * El backend devuelve la entidad y el array de unidades por separado.
 */
export interface EntidadConUnidades {
  entidad: Entidad
  unidades: EntidadUnidad[]
}

export interface EntidadFormData {
  nombre: string
  tipo: EntidadTipo
  departamento: string
  municipio?: string | null
}

export interface EntidadesMeta extends PaginationMeta {}

/** Filtros del listado. El backend acepta q, tipo, page y per_page. */
export interface EntidadesFiltros {
  q: string
  tipo: EntidadTipo | ''
  page: number
  per_page: number
}

export const ENTIDADES_POR_PAGINA = 10
