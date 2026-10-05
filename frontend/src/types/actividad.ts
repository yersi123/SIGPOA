import type { EstadoGestion } from './gestion'

export interface Actividad {
  id: number
  gestion_id: number
  unidad_id: number
  partida_id: number
  organizacion_id?: number | null
  objetivo: string
  meta?: string | null
  descripcion?: string | null
  /** Llega como string decimal desde PostgreSQL, p. ej. "150000.00". */
  monto_programado: number | string
  created_at?: string | null
  updated_at?: string | null
}

/**
 * Datos de v_ejecucion_actividad, que llegan por GET /actividades/{id}/ejecucion.
 *
 * El saldo y el porcentaje los calcula la vista en PostgreSQL; el frontend solo
 * los muestra y nunca los recalcula.
 */
export interface ActividadEjecucion {
  actividad_id: number
  gestion_id?: number
  unidad_id?: number
  partida_id?: number
  organizacion_id?: number | null
  objetivo?: string
  meta?: string | null
  monto_programado: number
  monto_ejecutado: number
  saldo: number
  porcentaje_ejecucion: number
  sobreejecutada: boolean
}

export interface ActividadFormData {
  gestion_id: number
  unidad_id: number
  partida_id: number
  organizacion_id?: number | null
  objetivo: string
  meta?: string | null
  descripcion?: string | null
  monto_programado: number
}

/**
 * El formulario trabaja los select como texto porque el desplegable no admite
 * un valor vacio, y el monto como texto para no perder decimales al convertirlo.
 */
export interface ActividadFormValues {
  gestion_id: string
  unidad_id: string
  partida_id: string
  organizacion_id: string
  objetivo: string
  meta: string
  descripcion: string
  monto_programado: string
}

/**
 * Actividad con los nombres de sus relaciones ya resueltos.
 *
 * ActividadResource no expone las relaciones anidadas aunque el controlador las
 * cargue con with(), asi que el frontend las cruza con consultas aparte.
 */
export interface ActividadConNombres extends Actividad {
  gestionAnio?: number
  gestionEstado?: EstadoGestion
  unidadNombre?: string
  partidaCodigo?: string
  partidaNombre?: string
  organizacionNombre?: string
}