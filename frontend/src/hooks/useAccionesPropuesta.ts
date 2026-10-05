import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { etiquetaEstado } from '@/lib/estados'
import api from '@/lib/api'
import { leerErrorApi } from '@/lib/api-errores'
import { aNumero } from '@/lib/formato'
import type { EstadoPropuesta } from '@/types/propuesta'

interface CambioEstadoPropuesta {
  id: number
  estado: EstadoPropuesta
  actividad_id?: number | null
  monto?: number | null
}

/**
 * Cambio de estado de una propuesta participativa (tarea 12.2).
 *
 * Todo pasa por `PATCH /propuestas/{id}/estado`, que ejecuta
 * sp_cambiar_estado_propuesta: es el procedimiento el que decide si el salto es
 * valido. Los 422 que devuelve son reglas de negocio, no fallos de forma, y su
 * texto llega en `message`, asi que se muestra tal cual.
 */
export function useAccionesPropuesta() {
  const queryClient = useQueryClient()

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado, actividad_id, monto }: CambioEstadoPropuesta) => {
      // actividad_id y monto solo viajan cuando se mandan: si se enviaran como
      // null en un simple avance, el procedimiento los tomaria como el nuevo
      // valor y borraria la imputacion de la propuesta.
      const cuerpo: Record<string, unknown> = { estado }
      if (actividad_id !== undefined) cuerpo.actividad_id = actividad_id
      if (monto !== undefined) cuerpo.monto = monto

      await api.patch(`/propuestas/${id}/estado`, cuerpo)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propuestas'] })
      queryClient.invalidateQueries({ queryKey: ['actividades'] })
      toast.success('Estado de la propuesta actualizado.')
    },
    onError: (error: unknown) => {
      const { status, message } = leerErrorApi(error)

      if (status === 403) {
        toast.error('No tienes permiso para cambiar el estado de la propuesta.')
        return
      }

      if (status === 422) {
        toast.error(message ?? 'El cambio de estado no está permitido.')
        return
      }

      toast.error(message ?? 'No se pudo cambiar el estado de la propuesta.')
    },
  })

  return { cambiarEstado, enCurso: cambiarEstado.isPending }
}

/**
 * Siguiente estado permitido de una propuesta, o null si ya no avanza.
 *
 * R5 solo admite el ciclo en orden: propuesto -> aprobado -> en_ejecucion ->
 * concluido. Sin saltos y sin retrocesos, que es justo lo que la base rechaza.
 */
export function siguienteEstadoPropuesta(estado: EstadoPropuesta): EstadoPropuesta | null {
  if (estado === 'propuesto') return 'aprobado'
  if (estado === 'aprobado') return 'en_ejecucion'
  if (estado === 'en_ejecucion') return 'concluido'
  return null
}

/**
 * El paso a aprobado es el unico que exige(activity del POA y monto. Si el
 * dialogo de estado tiene que abrir un formulario, es por esto.
 */
export function requiereImputacion(estado: EstadoPropuesta): boolean {
  return estado === 'aprobado'
}

/** Texto del boton segun el paso disponible. */
export function textoAccionEstado(estado: EstadoPropuesta): string | null {
  const siguiente = siguienteEstadoPropuesta(estado)
  return siguiente ? `Pasar a ${etiquetaEstado(siguiente)}` : null
}

/**
 * Monto que todavia puede imputarse a una actividad.
 *
 * La base rechaza la aprobacion cuando la suma de lo asignado a la actividad
 * supera su monto programado, asi que el margen se calcula para poder avisar
 * antes de enviar y no dejar al usuario en un 422 sin salida.
 *
 * Se excluye la propia propuesta para no descontar dos veces el monto que se
 * esta por imputar.
 */
export function montoDisponible(
  actividadId: number | null,
  montoProgramado: number | string | null | undefined,
  propuestas: Array<{ id: number; actividad_id?: number | null; monto_asignado: number | string }>,
  propuestaIdExcluir?: number,
): number {
  if (actividadId === null || actividadId === undefined) return 0

  const asignado = propuestas
    .filter((propuesta) => propuesta.actividad_id === actividadId && propuesta.id !== propuestaIdExcluir)
    .reduce((suma, propuesta) => suma + aNumero(propuesta.monto_asignado), 0)

  return aNumero(montoProgramado) - asignado
}