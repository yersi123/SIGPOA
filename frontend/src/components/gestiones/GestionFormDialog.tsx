import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { leerErrorApi, mensajeDeCampo } from '@/lib/api-errores'
import type { Gestion, GestionFormData } from '@/types/gestion'

/**
 * Los limites replican los de GestionRequest (ck_gestiones_anio y
 * uq_gestiones_anio) para que el 422 llegue al modal y no como error global.
 */
const gestionSchema = z.object({
  anio: z.coerce
    .number({ error: 'El año es obligatorio' })
    .int('El año debe ser un número entero')
    .min(2000, 'El año debe estar entre 2000 y 2100')
    .max(2100, 'El año debe estar entre 2000 y 2100'),
})

type GestionFormValues = z.infer<typeof gestionSchema>

interface GestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (gestion: Gestion) => void
}

const valoresVacios: GestionFormValues = { anio: new Date().getFullYear() }

/**
 * Alta de una gestion (tarea 3.4).
 *
 * La gestion nace siempre cerrada: el estado no se elige aqui. Para dejarla
 * abierta se usa la accion "Activar" del listado, que solo funciona cuando no
 * hay otra gestion abierta.
 */
export function GestionFormDialog({ open, onOpenChange, onSaved }: GestionFormDialogProps) {
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const form = useForm<GestionFormValues>({
    resolver: zodResolver(gestionSchema) as never,
    defaultValues: valoresVacios,
    mode: 'onBlur',
  })

  const { register, setError, formState } = form

  const onSubmit = async (values: GestionFormValues): Promise<void> => {
    setErrorGlobal(null)

    const payload: GestionFormData = { anio: values.anio }

    try {
      const respuesta = await api.post('/gestiones', payload, { skipGlobalToast: true })
      onSaved(respuesta.data.data as Gestion)
    } catch (error: unknown) {
      const { status, message } = leerErrorApi(error)
      const errorAnio = mensajeDeCampo(error, 'anio')

      if (status === 422 && errorAnio) {
        setError('anio', { message: errorAnio })
        return
      }

      if (status === 403) {
        setErrorGlobal('No tienes permiso para crear gestiones.')
        return
      }

      setErrorGlobal(message ?? 'No se pudo crear la gestión.')
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva gestión"
      description="Crea el año de planificación. Se registrará cerrada; actívala cuando cierres la gestión en curso."
      form={form}
      onSubmit={onSubmit}
      maxWidth="sm"
      submitText="Crear gestión"
      loading={formState.isSubmitting}
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="gestion-anio">Año</Label>
        <Input
          id="gestion-anio"
          type="number"
          min={2000}
          max={2100}
          placeholder="2027"
          {...register('anio')}
        />
        {formState.errors.anio && (
          <p className="text-sm text-destructive">{formState.errors.anio.message}</p>
        )}
      </div>
    </FormDialog>
  )
}