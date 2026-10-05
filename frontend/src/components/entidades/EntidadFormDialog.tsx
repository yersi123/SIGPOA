import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import {
  ENTIDAD_TIPOS,
  ENTIDAD_TIPO_LABELS,
  type Entidad,
  type EntidadFormData,
  type EntidadTipo,
} from '@/types/entidad'

/**
 * Los limites replican los de EntidadRequest en el backend, para que el 422
 * llegue al modal y no como error global. "departamento" es required en el
 * backend, asi que aqui tambien es obligatorio.
 */
const entidadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  tipo: z.enum(ENTIDAD_TIPOS, {
    error: 'Selecciona un tipo de entidad',
  }),
  departamento: z
    .string()
    .trim()
    .min(1, 'El departamento es obligatorio')
    .max(50, 'El departamento no puede superar los 50 caracteres'),
  municipio: z
    .string()
    .trim()
    .max(80, 'El municipio no puede superar los 80 caracteres')
    .optional(),
})

type EntidadFormValues = z.infer<typeof entidadSchema>

interface EntidadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Si viene, el dialogo edita; si es null, crea. */
  entidad: Entidad | null
  onSaved: (entidad: Entidad) => void
}

const valoresVacios: EntidadFormValues = {
  nombre: '',
  tipo: 'otro',
  departamento: '',
  municipio: '',
}

/** Valores iniciales: los de la entidad en edicion, o los vacios en el alta. */
function valoresIniciales(entidad: Entidad | null): EntidadFormValues {
  if (!entidad) return valoresVacios

  return {
    nombre: entidad.nombre,
    tipo: entidad.tipo,
    departamento: entidad.departamento,
    municipio: entidad.municipio ?? '',
  }
}

export function EntidadFormDialog({
  open,
  onOpenChange,
  entidad,
  onSaved,
}: EntidadFormDialogProps) {
  const esEdicion = entidad !== null
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const form = useForm<EntidadFormValues>({
    resolver: zodResolver(entidadSchema) as never,
    defaultValues: valoresIniciales(entidad),
    mode: 'onBlur',
  })

  const { register, control, setError, formState } = form

  // Los valores iniciales se calculan en el render, no en un efecto: el
  // componente se remonta con key={entidad.id} cada vez que el dialogo apunta
  // a otra entidad, asi que useForm ya nace con el prefill correcto.

  const onSubmit = async (values: EntidadFormValues): Promise<void> => {
    // El aviso global se limpia en cada envio, nunca desde un efecto: asi el
    // mensaje de un intento fallido anterior no sobrevive al siguiente envio.
    setErrorGlobal(null)

    const payload: EntidadFormData = {
      nombre: values.nombre.trim(),
      tipo: values.tipo,
      departamento: values.departamento.trim(),
      municipio: values.municipio?.trim() ? values.municipio.trim() : null,
    }

    try {
      const respuesta = esEdicion
        ? await api.put(`/entidades/${entidad.id}`, payload)
        : await api.post('/entidades', payload)

      onSaved(respuesta.data.data as Entidad)
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number
          data?: { message?: string; errors?: Record<string, string[]> }
        }
      }

      const status = axiosError.response?.status
      const errores = axiosError.response?.data?.errors

      // 422: los errores por campo se pintan dentro del modal.
      if (status === 422 && errores) {
        let huboCampo = false

        for (const [campo, mensajes] of Object.entries(errores)) {
          const mensaje = mensajes?.[0]
          if (!mensaje) continue
          if (campo === 'nombre' || campo === 'departamento' || campo === 'municipio' || campo === 'tipo') {
            setError(campo as keyof EntidadFormValues, { message: mensaje })
            huboCampo = true
          }
        }

        if (huboCampo) return
      }

      // 403 lo devuelve la policy; el resto se muestra como alerta global.
      setErrorGlobal(
        axiosError.response?.data?.message ??
          (status === 403
            ? 'No tienes permiso para guardar esta entidad.'
            : 'No se pudo guardar la entidad. Inténtalo de nuevo.'),
      )
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar Entidad' : 'Nueva Entidad'}
      description={
        esEdicion
          ? 'Modifica los datos de la entidad y guarda los cambios.'
          : 'Registra una nueva entidad en el sistema.'
      }
      maxWidth="md"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText={esEdicion ? 'Guardar cambios' : 'Crear entidad'}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={formState.isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formState.isSubmitting
              ? 'Guardando...'
              : esEdicion
                ? 'Guardar cambios'
                : 'Crear entidad'}
          </Button>
        </>
      }
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="entidad-nombre">Nombre *</Label>
        <Input
          id="entidad-nombre"
          placeholder="Ej. Municipalidad de La Paz"
          disabled={formState.isSubmitting}
          aria-invalid={!!formState.errors.nombre}
          {...register('nombre')}
        />
        {formState.errors.nombre && (
          <p className="text-xs text-destructive">{formState.errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entidad-tipo">Tipo *</Label>
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(valor: string) => field.onChange(valor as EntidadTipo)}
              disabled={formState.isSubmitting}
            >
<SelectTrigger id="entidad-tipo" aria-invalid={!!formState.errors.tipo}>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {ENTIDAD_TIPOS.map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {ENTIDAD_TIPO_LABELS[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entidad-departamento">Departamento *</Label>
        <Input
          id="entidad-departamento"
          placeholder="Ej. La Paz"
          disabled={formState.isSubmitting}
          aria-invalid={!!formState.errors.departamento}
          {...register('departamento')}
        />
        {formState.errors.departamento && (
          <p className="text-xs text-destructive">{formState.errors.departamento.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entidad-municipio">Municipio</Label>
        <Input
          id="entidad-municipio"
          placeholder="Opcional. Ej. La Paz"
          disabled={formState.isSubmitting}
          aria-invalid={!!formState.errors.municipio}
          {...register('municipio')}
        />
        {formState.errors.municipio && (
          <p className="text-xs text-destructive">{formState.errors.municipio.message}</p>
        )}
      </div>
    </FormDialog>
  )
}
