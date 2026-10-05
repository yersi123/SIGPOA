import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FormDialog } from '@/components/common/FormDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useEntidadesLookup } from '@/hooks/useLookups'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import { valorOguion } from '@/lib/formato'
import type { Unidad, UnidadFormData, UnidadFormValues } from '@/types/unidad'

/**
 * Limites de UnidadRequest en el backend. entidad_id es required y debe existir,
 * por eso aqui tambien es obligatorio.
 */
const unidadSchema = z.object({
  entidad_id: z.string().min(1, 'Selecciona la entidad a la que pertenece la unidad'),
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'El nombre no puede superar los 120 caracteres'),
  responsable: z
    .string()
    .trim()
    .max(120, 'El responsable no puede superar los 120 caracteres')
    .optional(),
})

const CAMPOS_MAPEABLES = ['entidad_id', 'nombre', 'responsable'] as const

interface UnidadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Si viene, el dialogo edita; si es null, crea. */
  unidad: Unidad | null
  /** Nombre resuelto de la entidad, para el titulo del campo del selector. */
  onSaved: (unidad: Unidad) => void
}

/** FormDialog de alta y edicion de una unidad (tareas 5.1 y 5.2). */
export function UnidadFormDialog({ open, onOpenChange, unidad, onSaved }: UnidadFormDialogProps) {
  const esEdicion = unidad !== null
  const entidades = useEntidadesLookup(open)
  const catalogoEntidades = entidades.data ?? []

  const form = useForm<UnidadFormValues>({
    resolver: zodResolver(unidadSchema) as never,
    defaultValues: {
      entidad_id: unidad ? String(unidad.entidad_id) : '',
      nombre: unidad?.nombre ?? '',
      responsable: unidad?.responsable ?? '',
    },
    mode: 'onBlur',
  })

  const { register, control, formState } = form

  // useWatch en vez de form.watch: el valor llega solo al desplegable que lo usa
  // y no se recompone todo el dialogo en cada pulsacion del teclado.
  const entidadId = useWatch({ control, name: 'entidad_id' })

  // Los valores iniciales se calculan en el render: la pagina remonta el
  // dialogo con key={unidad.id} cada vez que cambia el registro en edicion.
  const { onSubmit, errorGlobal } = useGuardarRecurso<UnidadFormValues, Unidad>({
    form,
    ruta: '/unidades',
    id: unidad?.id ?? null,
    aPayload: (valores): UnidadFormData => ({
      entidad_id: Number(valores.entidad_id),
      nombre: valores.nombre.trim(),
      responsable: valores.responsable?.trim() ? valores.responsable.trim() : null,
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: esEdicion ? 'Unidad actualizada correctamente.' : 'Unidad creada correctamente.',
    clave: 'unidades',
    sinPermiso: 'No tienes permiso para guardar esta unidad.',
    generico: 'No se pudo guardar la unidad. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar Unidad' : 'Nueva Unidad'}
      description={
        esEdicion
          ? 'Modifica los datos de la unidad y guarda los cambios.'
          : 'Registra una unidad nueva perteneciente a una entidad.'
      }
      maxWidth="md"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText={esEdicion ? 'Guardar cambios' : 'Crear unidad'}
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <CampoSelect
        id="unidad-entidad"
        label="Entidad"
        obligatorio
        valor={entidadId}
        onValorChange={(valor) => form.setValue('entidad_id', valor, { shouldValidate: true })}
        placeholder={entidades.isLoading ? 'Cargando entidades...' : 'Selecciona la entidad'}
        opciones={catalogoEntidades.map((entidad) => ({
          valor: String(entidad.id),
          etiqueta: entidad.nombre,
        }))}
        error={formState.errors.entidad_id?.message}
        descripcion="La unidad queda colgando de la entidad seleccionada."
      />

      <CampoTexto
        id="unidad-nombre"
        label="Nombre"
        obligatorio
        placeholder="Ej. Secretaría de Obras Públicas"
        disabled={formState.isSubmitting}
        error={formState.errors.nombre?.message}
        {...register('nombre')}
      />

      <CampoTexto
        id="unidad-responsable"
        label="Responsable"
        placeholder="Opcional. Ej. Ing. Carlos Rojas"
        disabled={formState.isSubmitting}
        error={formState.errors.responsable?.message}
        {...register('responsable')}
      />

      {esEdicion && (
        <p className="text-xs text-muted-foreground">
          Entidad actual: {valorOguion(catalogoEntidades.find((e) => e.id === unidad.entidad_id)?.nombre)}
        </p>
      )}
    </FormDialog>
  )
}