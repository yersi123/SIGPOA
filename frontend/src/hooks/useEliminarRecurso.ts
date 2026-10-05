import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import api from '@/lib/api'
import { leerErrorApi } from '@/lib/api-errores'

interface OpcionesEliminar {
  /** Clave raiz del cache para invalidar, p. ej. 'unidades'. */
  clave: string
  /** Ruta base del recurso, p. ej. '/unidades'. */
  ruta: string
  exito: string
  generico: string
  /** Mensaje del 409 cuando el registro esta en uso. */
  conflicto: string
  /** Cierra el dialogo de confirmacion al terminar bien o con conflicto. */
  alTerminar?: () => void
}

/**
 * Borrado de un recurso con el 409 tratado.
 *
 * El backend responde 409 cuando el registro esta referenciado, y el requisito
 * es cerrar el dialogo y avisar con un toast en lugar de dejarlo abierto: por
 * eso `alTerminar` se dispara tambien en ese caso.
 */
export function useEliminarRecurso(opciones: OpcionesEliminar) {
  const { clave, ruta, exito, generico, conflicto, alTerminar } = opciones
  const queryClient = useQueryClient()

  const mutacion = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${ruta}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [clave] })
      alTerminar?.()
      toast.success(exito)
    },
    onError: (error: unknown) => {
      const { status, message } = leerErrorApi(error)

      if (status === 409) {
        alTerminar?.()
        toast.error(message ?? conflicto)
        return
      }

      toast.error(message ?? generico)
    },
  })

  return mutacion
}