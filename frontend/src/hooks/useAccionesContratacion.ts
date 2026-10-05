import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { etiquetaEstado } from '@/lib/estados'
import api from '@/lib/api'
import { leerErrorApi } from '@/lib/api-errores'
import type { EstadoContratacion } from '@/types/contratacion'

interface CambioEstado {
  id: number
  estado: EstadoContratacion
}

/**
 * Cambio de estado y adjudicacion de una contratacion (tareas 11.2 y 11.3).
 *
 * Son dos endpoints distintos a proposito: el paso a cotizacion es un PATCH
 * normal, pero adjudicar llama a `sp_adjudicar_contratacion` (R7), que es el
 * unico camino que la base de datos acepta para pasar a adjudicada.
 *
 * Los 422 de aqui casi nunca son de validacion de forma: son el trigger
 * rechazando un salto o un retroceso, y su texto llega en `message`, asi que se
 * muestra tal cual en un toast en vez de pelearse con el formulario.
 */
export function useAccionesContratacion() {
  const queryClient = useQueryClient()

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ['contrataciones'] })
  }

  const avisarError = (error: unknown) => {
    const { status, message } = leerErrorApi(error)

    if (status === 403) {
      toast.error('No tienes permiso para cambiar el estado de la contratación.')
      return
    }

    if (status === 422) {
      toast.error(message ?? 'El cambio de estado no está permitido.')
      return
    }

    toast.error(message ?? 'No se pudo cambiar el estado de la contratación.')
  }

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }: CambioEstado) => {
      await api.patch(`/contrataciones/${id}/estado`, { estado })
    },
    onSuccess: () => {
      refrescar()
      toast.success('Estado de la contratación actualizado.')
    },
    onError: avisarError,
  })

  const adjudicar = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/contrataciones/${id}/adjudicar`)
    },
    onSuccess: () => {
      refrescar()
      toast.success('Contratación adjudicada correctamente.')
    },
    onError: avisarError,
  })

  return {
    cambiarEstado,
    adjudicar,
    enCurso: cambiarEstado.isPending || adjudicar.isPending,
  }
}

/**
 * Siguiente estado permitido de una contratacion, o null si ya no avanza.
 *
 * Los saltos y retrocesos los rechaza el trigger de la base, pero no tiene
 * sentido ofrecer en pantalla un boton que solo puede terminar en 422.
 */
export function siguienteEstadoContratacion(
  estado: EstadoContratacion,
): EstadoContratacion | null {
  if (estado === 'solicitud') return 'cotizacion'
  if (estado === 'cotizacion') return 'adjudicada'
  return null
}

/** Texto del boton segun el paso disponible. */
export function textoAccionEstado(estado: EstadoContratacion): string | null {
  const siguiente = siguienteEstadoContratacion(estado)
  return siguiente ? `Marcar como ${etiquetaEstado(siguiente)}` : null
}