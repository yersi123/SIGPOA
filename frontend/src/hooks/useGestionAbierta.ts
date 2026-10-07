import { useQuery } from '@tanstack/react-query'

import api from '@/lib/api'
import type { Gestion } from '@/types/gestion'
import type { PaginatedResponse } from '@/types/common'

/**
 * Devuelve la gestion abierta actual, si existe.
 *
 * La regla R1 permite una sola gestion abierta a la vez, pero el listado del
 * modulo esta paginado: la abierta puede estar en otra pagina. Esta consulta la
 * busca aparte para poder habilitar o deshabilitar el boton "Activar" sin
 * depender de la pagina visible.
 */
export function useGestionAbierta() {
  const consulta = useQuery({
    queryKey: ['gestiones', 'abierta'],
    queryFn: async () => {
      const respuesta = await api.get<PaginatedResponse<Gestion>>('/gestiones', {
        params: { estado: 'abierta', per_page: 1 },
      })
      return respuesta.data.data[0] ?? null
    },
  })

  return {
    gestionAbierta: consulta.data ?? null,
    cargando: consulta.isPending,
  }
}