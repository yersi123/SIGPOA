import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { CampoTextarea } from '@/components/common/campos/CampoTextarea'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import { useActividadesLookup, useProveedoresLookup } from '@/hooks/useLookups'
import type { Contratacion, ContratacionFormData, EstadoContratacion } from '@/types/contratacion'

/** Los tres estados de EstadoContratacion, en el orden del ciclo de vida. */
const ESTADOS: EstadoContratacion[] = ['solicitud', 'cotizacion', 'adjudicada']

/**
 * Limites de ContratacionRequest.
 *
 * actividad_id, proveedor_id, descripcion, monto_cotizado, estado y fecha son
 * obligatorios. Las dos fechas de cotizacion y adjudicacion son opcionales pero
 * no pueden ser anteriores a la fecha que las precede: el backend lo valida con
 * `after_or_equal`, y aqui se replica para no depender de un viaje de ida y
 * vuelta al servidor.
 */
const contratacionSchema = z
  .object({
    actividad_id: z.string().min(1, 'Selecciona la actividad'),
    proveedor_id: z.string().min(1, 'Selecciona el proveedor'),
    descripcion: z
      .string()
      .trim()
      .min(1, 'La descripción es obligatoria')
      .max(250, 'La descripción no puede superar los 250 caracteres'),
    monto_cotizado: z
      .string()
      .trim()
      .min(1, 'El monto cotizado es obligatorio')
      .refine((valor) => !Number.isNaN(Number(valor)), 'El monto debe ser un número')
      .refine((valor) => Number(valor) >= 0, 'El monto no puede ser negativo'),
    estado: z.string().min(1, 'Selecciona el estado'),
    fecha: z.string().min(1, 'La fecha es obligatoria'),
    fecha_cotizacion: z.string().optional(),
    fecha_adjudicacion: z.string().optional(),
  })
  .refine((valores) => !valores.fecha_cotizacion || valores.fecha_cotizacion >= valores.fecha, {
    message: 'La fecha de cotización no puede ser anterior a la fecha',
    path: ['fecha_cotizacion'],
  })
  .refine(
    (valores) =>
      !valores.fecha_adjudicacion ||
      !valores.fecha_cotizacion ||
      valores.fecha_adjudicacion >= valores.fecha_cotizacion,
    {
      message: 'La fecha de adjudicación no puede ser anterior a la fecha de cotización',
      path: ['fecha_adjudicacion'],
    },
  )

type ContratacionFormValues = z.infer<typeof contratacionSchema>

const CAMPOS_MAPEABLES = [
  'actividad_id',
  'proveedor_id',
  'descripcion',
  'monto_cotizado',
  'estado',
  'fecha',
  'fecha_cotizacion',
  'fecha_adjudicacion',
] as const

/** Convierte la fecha vacia en null: el backend no acepta cadena vacia en un date. */
function fechaONulo(valor?: string): string | null {
  return valor?.trim() ? valor : null
}

/**
 * Fecha de hoy para el valor por defecto.
 *
 * Se calcula una sola vez al cargar el modulo y no dentro del render: si se
 * pidiera `new Date()` al construir los defaultValues, cualquier re-render
 * devolveria una fecha distinta y el valor por defecto ya no seria estable.
 */
const FECHA_HOY = new Date().toISOString().slice(0, 10)

interface ContratacionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (contratacion: Contratacion) => void
}

/**
 * Alta de una contratacion (tarea 11.1).
 *
 * Sin edicion: el backend responde 405 a `PUT /contrataciones/{id}`, asi que no
 * hay formulario de modificacion aunque el listado lo pidiera. Una vez creada,
 * lo unico que se puede mover es el estado.
 */
export function ContratacionFormDialog({ open, onOpenChange, onSaved }: ContratacionFormDialogProps) {
  // Los catalogos solo se piden mientras el dialogo esta abierto.
  const actividades = useActividadesLookup(open)
  const proveedores = useProveedoresLookup(open)

  const form = useForm<ContratacionFormValues>({
    resolver: zodResolver(contratacionSchema) as never,
    defaultValues: {
      actividad_id: '',
      proveedor_id: '',
      descripcion: '',
      monto_cotizado: '',
      estado: 'solicitud',
      fecha: FECHA_HOY,
      fecha_cotizacion: '',
      fecha_adjudicacion: '',
    },
    mode: 'onBlur',
  })

  const { register, control, formState } = form

  const actividadId = useWatch({ control, name: 'actividad_id' })
  const proveedorId = useWatch({ control, name: 'proveedor_id' })
  const estado = useWatch({ control, name: 'estado' })

  const { onSubmit, errorGlobal } = useGuardarRecurso<ContratacionFormValues, Contratacion>({
    form,
    ruta: '/contrataciones',
    id: null,
    aPayload: (valores): ContratacionFormData => ({
      actividad_id: Number(valores.actividad_id),
      proveedor_id: Number(valores.proveedor_id),
      descripcion: valores.descripcion.trim(),
      monto_cotizado: Number(valores.monto_cotizado),
      estado: valores.estado as EstadoContratacion,
      fecha: valores.fecha,
      fecha_cotizacion: fechaONulo(valores.fecha_cotizacion),
      fecha_adjudicacion: fechaONulo(valores.fecha_adjudicacion),
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: 'Contratación creada correctamente.',
    clave: 'contrataciones',
    sinPermiso: 'Solo el administrador puede crear contrataciones.',
    generico: 'No se pudo crear la contratación. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  const catalogosCargando = actividades.isPending || proveedores.isPending

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva contratación"
      description="Registra una contratación y su estado inicial."
      maxWidth="lg"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText="Crear contratación"
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          id="contratacion-actividad"
          label="Actividad"
          obligatorio
          valor={actividadId ?? ''}
          onValorChange={(valor) =>
            form.setValue('actividad_id', valor, { shouldValidate: true })
          }
          placeholder={catalogosCargando ? 'Cargando actividades...' : 'Selecciona la actividad'}
          opciones={(actividades.data ?? []).map((actividad) => ({
            valor: String(actividad.id),
            etiqueta: actividad.objetivo,
            secundario: `#${actividad.id}`,
          }))}
          error={formState.errors.actividad_id?.message}
        />

        <CampoSelect
          id="contratacion-proveedor"
          label="Proveedor"
          obligatorio
          valor={proveedorId ?? ''}
          onValorChange={(valor) =>
            form.setValue('proveedor_id', valor, { shouldValidate: true })
          }
          placeholder={catalogosCargando ? 'Cargando proveedores...' : 'Selecciona el proveedor'}
          opciones={(proveedores.data ?? []).map((proveedor) => ({
            valor: String(proveedor.id),
            etiqueta: proveedor.nombre,
            secundario: proveedor.nit ?? undefined,
          }))}
          error={formState.errors.proveedor_id?.message}
        />

        <CampoSelect
          id="contratacion-estado"
          label="Estado"
          obligatorio
          valor={estado ?? ''}
          onValorChange={(valor) => form.setValue('estado', valor, { shouldValidate: true })}
          placeholder="Selecciona el estado"
          opciones={ESTADOS.map((valor) => ({ valor, etiqueta: valor }))}
          error={formState.errors.estado?.message}
          descripcion="El avance posterior se hace con el botón de cambio de estado."
        />

        <CampoTexto
          id="contratacion-monto"
          label="Monto cotizado (Bs)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="Ej. 60000.00"
          obligatorio
          disabled={formState.isSubmitting}
          error={formState.errors.monto_cotizado?.message}
          {...register('monto_cotizado')}
        />

        <CampoTexto
          id="contratacion-fecha"
          label="Fecha"
          type="date"
          obligatorio
          disabled={formState.isSubmitting}
          error={formState.errors.fecha?.message}
          {...register('fecha')}
        />

        <CampoTexto
          id="contratacion-fecha-cotizacion"
          label="Fecha de cotización"
          type="date"
          disabled={formState.isSubmitting}
          error={formState.errors.fecha_cotizacion?.message}
          descripcion="Opcional. No puede ser anterior a la fecha."
          {...register('fecha_cotizacion')}
        />

        <CampoTexto
          id="contratacion-fecha-adjudicacion"
          label="Fecha de adjudicación"
          type="date"
          disabled={formState.isSubmitting}
          error={formState.errors.fecha_adjudicacion?.message}
          descripcion="Opcional. No puede ser anterior a la cotización."
          {...register('fecha_adjudicacion')}
        />
      </div>

      <CampoTextarea
        id="contratacion-descripcion"
        label="Descripción"
        placeholder="Ej. Adquisición de equipos informáticos"
        obligatorio
        disabled={formState.isSubmitting}
        error={formState.errors.descripcion?.message}
        descripcion="Máximo 250 caracteres."
        {...register('descripcion')}
      />
    </FormDialog>
  )
}