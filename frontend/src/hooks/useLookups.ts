import { useQuery } from '@tanstack/react-query'

import api from '@/lib/api'
import type { Actividad } from '@/types/actividad'
import type { Entidad } from '@/types/entidad'
import type { Organizacion } from '@/types/organizacion'
import type { Partida } from '@/types/partida'
import type { Propuesta } from '@/types/propuesta'
import type { Proveedor } from '@/types/proveedor'
import type { Unidad } from '@/types/unidad'
import type { Gestion } from '@/types/gestion'
import type { PaginatedResponse } from '@/types/common'

/**
 * Rutas de consulta auxiliares que alimentan los desplegables de otros recursos.
 *
 * Estas peticiones van aparte porque la pagina ya trae su listado: son datos de
 * apoyo, se piden una vez y se cachean por react-query, no en cada render.
 */

async function cargarTodas<T>(ruta: string): Promise<T[]> {
  const respuesta = await api.get<PaginatedResponse<T>>(`${ruta}?per_page=200`)
  return respuesta.data.data
}

/** Entidades para el desplegable de unidades. */
export function useEntidadesLookup(habilitado = true) {
  return useQuery({
    queryKey: ['entidades', 'lookup'],
    queryFn: () => cargarTodas<Entidad>('/entidades'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/** Unidades, para los filtros y el formulario de actividades. */
export function useUnidadesLookup(habilitado = true) {
  return useQuery({
    queryKey: ['unidades', 'lookup'],
    queryFn: () => cargarTodas<Unidad>('/unidades'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/** Partidas presupuestarias, para el formulario de actividades. */
export function usePartidasLookup(habilitado = true) {
  return useQuery({
    queryKey: ['partidas', 'lookup'],
    queryFn: () => cargarTodas<Partida>('/partidas'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/** Organizaciones, para el filtro opcional de actividades. */
export function useOrganizacionesLookup(habilitado = true) {
  return useQuery({
    queryKey: ['organizaciones', 'lookup'],
    queryFn: () => cargarTodas<Organizacion>('/organizaciones'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/** Gestiones, para elegir el anio de una actividad. */
export function useGestionesLookup(habilitado = true) {
  return useQuery({
    queryKey: ['gestiones', 'lookup'],
    queryFn: () => cargarTodas<Gestion>('/gestiones'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Actividades, para los filtros y formularios de gastos y contrataciones.
 *
 * El backend no expone las relaciones anidadas, asi que el nombre que se pinta
 * en la tabla se resuelve cruzando por id contra esta lista.
 */
export function useActividadesLookup(habilitado = true) {
  return useQuery({
    queryKey: ['actividades', 'lookup'],
    queryFn: () => cargarTodas<Actividad>('/actividades'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/** Proveedores, para el filtro y el formulario de contrataciones. */
export function useProveedoresLookup(habilitado = true) {
  return useQuery({
    queryKey: ['proveedores', 'lookup'],
    queryFn: () => cargarTodas<Proveedor>('/proveedores'),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Propuestas participativas, para calcular cuanto monto tiene libre cada
 * actividad antes de aprobar una propuesta.
 *
 * No se usa en los listados: alli la paginacion la trae el propio endpoint.
 * Se carga solo con el dialogo de aprobacion abierto, porque hace falta la
 * suma de lo ya asignado a cada actividad para no ofrecer un monto que la base
 * de datos va a rechazar.
 */
export function usePropuestasLookup(habilitado = true) {
  return useQuery({
    queryKey: ['propuestas', 'lookup'],
    queryFn: () => cargarTodas<Propuesta>('/propuestas'),
    enabled: habilitado,
    staleTime: 60 * 1000,
  })
}