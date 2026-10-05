import { useQuery } from '@tanstack/react-query'

import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Gasto } from '@/types/gasto'

/**
 * Gastos registrados en una actividad (tarea 10.1).
 *
 * A diferencia del resto de listados, este endpoint no pagina: el controlador
 * responde `ok(GastoResource::collection($gastos))` con un `get()` simple, sin
 * el envoltorio `meta` de Paginador. Por eso no se puede reutilizar
 * `useListadoRecurso` y aqui se cuenta la lista en el cliente.
 *
 * Tampoco existe un listado global de gastos ni un detalle por id: los gastos
 * solo se ven siempre colgados de su actividad.
 */
export function useGastosActividad(actividadId: number | null, habilitado = true) {
  const consulta = useQuery({
    queryKey: ['gastos', actividadId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Gasto[]>>(`/actividades/${actividadId}/gastos`)
      return respuesta.data.data
    },
    enabled: habilitado && actividadId !== null && actividadId > 0,
  })

  const gastos = consulta.data ?? []

  return {
    gastos,
    total: gastos.length,
    totalMonto: gastos.reduce((suma, gasto) => suma + Number(gasto.monto ?? 0), 0),
    cargando: consulta.isPending,
    error: consulta.isError ? 'No se pudo cargar los gastos de la actividad.' : undefined,
    recargar: consulta.refetch,
  }
}