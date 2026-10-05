/**
 * Metadata de paginacion.
 *
 * Refleja lo que devuelve App\Support\Paginador::envelopar(): total,
 * current_page, last_page, per_page, from y to. Laravel no envia 'path' ni
 * 'links' porque el paginador se arma a mano, asi que aqui son opcionales.
 */
export interface PaginationMeta {
  total: number
  current_page: number
  last_page: number
  per_page: number
  from: number | null
  to: number | null
  path?: string
  links?: Array<{
    url: string | null
    label: string
    active: boolean
  }>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: PaginationMeta
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}
