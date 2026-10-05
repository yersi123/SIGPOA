import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import api from '@/lib/api'
import { leerErrorApi, mensajeDeCampo } from '@/lib/api-errores'

interface OpcionesGuardar<T extends FieldValues, R> {
  form: UseFormReturn<T>
  /** Ruta base del recurso, p. ej. '/unidades'. */
  ruta: string
  /** Id a editar, o null para crear. */
  id: number | null
  /** Convierte los valores del formulario en el cuerpo que espera la API. */
  aPayload: (valores: T) => unknown
  /** Campos del formulario a los que se puede mapear un 422. */
  camposMapeables: ReadonlyArray<Path<T>>
  exito: string
  /** Clave de react-query a invalidar. */
  clave: string
  /** Mensaje cuando el backend responde 403. */
  sinPermiso: string
  /** Mensaje generico de fallo de red o de servidor. */
  generico: string
  alGuardar: (resultado: R) => void
}

/**
 * Alta y modificacion de un recurso desde un modal.
 *
 * Concentra lo que los cinco formularios CRUD repiten: el POST o PUT segun haya
 * id, el reparto de los 422 por campo del 422 y el toast de exito.
 */
export function useGuardarRecurso<T extends FieldValues, R = unknown>(
  opciones: OpcionesGuardar<T, R>,
) {
  const {
    form,
    ruta,
    id,
    aPayload,
    camposMapeables,
    exito,
    clave,
    sinPermiso,
    generico,
    alGuardar,
  } = opciones

  const queryClient = useQueryClient()
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const { setError, formState } = form

  const onSubmit = async (valores: T): Promise<void> => {
    // El aviso se limpia en cada envio, nunca desde un efecto, para que el
    // mensaje de un intento fallido no sobreviva al siguiente.
    setErrorGlobal(null)

    const esEdicion = id !== null

    try {
      const respuesta = esEdicion
        ? await api.put(`${ruta}/${id}`, aPayload(valores))
        : await api.post(ruta, aPayload(valores))

      queryClient.invalidateQueries({ queryKey: [clave] })
      alGuardar(respuesta.data.data)
      toast.success(exito)
    } catch (error: unknown) {
      const { status } = leerErrorApi(error)

      if (status === 422) {
        let huboCampo = false

        for (const campo of camposMapeables) {
          const mensaje = mensajeDeCampo(error, campo)
          if (mensaje) {
            setError(campo, { message: mensaje })
            huboCampo = true
          }
        }

        // Si el 422 solo trae campos que el formulario no expone, cae al aviso
        // global en lugar de tragarselo en silencio.
        if (huboCampo) return
      }

      if (status === 403) {
        setErrorGlobal(sinPermiso)
        return
      }

      setErrorGlobal(leerErrorApi(error).message ?? generico)
    }
  }

  return { onSubmit, errorGlobal, guardarEnCurso: formState.isSubmitting }
}