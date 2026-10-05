import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { CampoTextarea } from '@/components/common/campos/CampoTextarea'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import { useActividadesLookup, useGestionesLookup, useOrganizacionesLookup } from '@/hooks/useLookups'
import type { EstadoPropuesta, Propuesta, PropuestaFormData } from '@/types/propuesta'

/** Los cuatro estados de EstadoPropuesta, en el orden del ciclo. */
const ESTADOS: EstadoPropuesta[] = ['propuesto', 'aprobado', 'en_ejecucion', 'concluido']

/**
 * Limites de PropuestaRequest.
 *
 * organizacion_id, gestion_id, titulo y monto_asignado son obligatorios;
 * actividad_id, descripcion y estado no. El monto admite cero porque una
 * propuesta nace sin presupuesto: lo que no puede ser cero es el monto con el
 * que se aprueba, y eso lo valida sp_cambiar_estado_propuesta.
 */
const propuestaSchema = z.object({
  organizacion_id: z.string().min(1, 'Selecciona la organización'),
  gestion_id: z.string().min(1, 'Selecciona la gestión'),
  actividad_id: z.string().optional(),
  titulo: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio')
    .max(200, 'El título no puede superar los 200 caracteres'),
  descripcion: z.string().trim().optional(),
  monto_asignado: z
    .string()
    .trim()
    .min(1, 'El monto asignado es obligatorio')
    .refine((valor) => !Number.isNaN(Number(valor)), 'El monto debe ser un número')
    .refine((valor) => Number(valor) >= 0, 'El monto no puede ser negativo'),
  estado: z.string().optional(),
})

type PropuestaFormValues = z.infer<typeof propuestaSchema>

const CAMPOS_MAPEABLES = [
  'organizacion_id',
  'gestion_id',
  'actividad_id',
  'titulo',
  'descripcion',
  'monto_asignado',
  'estado',
] as const

/** Convierte la '' del desplegable opcional en el null que espera la API. */
function idONulo(valor?: string): number | null {
  return valor?.trim() ? Number(valor) : null
}

interface PropuestaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (propuesta: Propuesta) => void
}

/**
 * Alta de una propuesta participativa (tarea 12.1).
 *
 * Sin edicion: `PUT /propuestas/{id}` responde 405. La actividad y el monto
 * tambien quedan fuera de la alta con sentido, porque R5 exige que se imputen
 * en el paso a aprobado y no antes: crear la propuesta ya aprobada se saltaria
 * esa validacion.
 */
export function PropuestaFormDialog({ open, onOpenChange, onSaved }: PropuestaFormDialogProps) {
  const organizaciones = useOrganizacionesLookup(open)
  const gestiones = useGestionesLookup(open)
  const actividades = useActividadesLookup(open)

  const form = useForm<PropuestaFormValues>({
    resolver: zodResolver(propuestaSchema) as never,
    defaultValues: {
      organizacion_id: '',
      gestion_id: '',
      actividad_id: '',
      titulo: '',
      descripcion: '',
      monto_asignado: '0',
      estado: 'propuesto',
    },
    mode: 'onBlur',
  })

  const { register, control, formState } = form

  const organizacionId = useWatch({ control, name: 'organizacion_id' })
  const gestionId = useWatch({ control, name: 'gestion_id' })
  const actividadId = useWatch({ control, name: 'actividad_id' })
  const estado = useWatch({ control, name: 'estado' })

  const { onSubmit, errorGlobal } = useGuardarRecurso<PropuestaFormValues, Propuesta>({
    form,
    ruta: '/propuestas',
    id: null,
    aPayload: (valores): PropuestaFormData => ({
      organizacion_id: Number(valores.organizacion_id),
      gestion_id: Number(valores.gestion_id),
      actividad_id: idONulo(valores.actividad_id),
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion?.trim() ? valores.descripcion.trim() : null,
      monto_asignado: Number(valores.monto_asignado),
      estado: (valores.estado || 'propuesto') as EstadoPropuesta,
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: 'Propuesta creada correctamente.',
    clave: 'propuestas',
    sinPermiso: 'Solo el administrador puede crear propuestas.',
    generico: 'No se pudo crear la propuesta. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  const catalogosCargando =
    organizaciones.isPending || gestiones.isPending || actividades.isPending

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva propuesta participativa"
      description="Registra una propuesta de la organización social."
      maxWidth="lg"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText="Crear propuesta"
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          id="propuesta-organizacion"
          label="Organización"
          obligatorio
          valor={organizacionId ?? ''}
          onValorChange={(valor) =>
            form.setValue('organizacion_id', valor, { shouldValidate: true })
          }
          placeholder={
            catalogosCargando ? 'Cargando organizaciones...' : 'Selecciona la organización'
          }
          opciones={(organizaciones.data ?? []).map((organizacion) => ({
            valor: String(organizacion.id),
            etiqueta: organizacion.nombre,
            secundario: organizacion.tipo,
          }))}
          error={formState.errors.organizacion_id?.message}
        />

        <CampoSelect
          id="propuesta-gestion"
          label="Gestión"
          obligatorio
          valor={gestionId ?? ''}
          onValorChange={(valor) => form.setValue('gestion_id', valor, { shouldValidate: true })}
          placeholder={catalogosCargando ? 'Cargando gestiones...' : 'Selecciona la gestión'}
          opciones={(gestiones.data ?? []).map((gestion) => ({
            valor: String(gestion.id),
            etiqueta: `${gestion.anio}`,
            secundario: gestion.estado,
            disabled: gestion.estado === 'cerrada',
          }))}
          error={formState.errors.gestion_id?.message}
          descripcion="No se admiten propuestas en gestiones cerradas."
        />

        <CampoTexto
          id="propuesta-monto"
          label="Monto asignado (Bs)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="Ej. 0.00"
          obligatorio
          disabled={formState.isSubmitting}
          error={formState.errors.monto_asignado?.message}
          descripcion="Puede empezar en 0 y definirse al aprobar la propuesta."
          {...register('monto_asignado')}
        />

        <CampoSelect
          id="propuesta-estado"
          label="Estado inicial"
          valor={estado ?? 'propuesto'}
          onValorChange={(valor) => form.setValue('estado', valor, { shouldValidate: true })}
          placeholder="Propuesto"
          opciones={ESTADOS.map((valor) => ({ valor, etiqueta: valor }))}
          error={formState.errors.estado?.message}
          descripcion="Lo normal es empezar en 'propuesto' y avanzar con el botón de estado."
        />
      </div>

      <CampoTexto
        id="propuesta-titulo"
        label="Título"
        obligatorio
        placeholder="Ej. Capacitación en seguridad vial"
        disabled={formState.isSubmitting}
        error={formState.errors.titulo?.message}
        descripcion="Máximo 200 caracteres."
        {...register('titulo')}
      />

      <CampoSelect
        id="propuesta-actividad"
        label="Actividad del POA"
        valor={actividadId ?? ''}
        onValorChange={(valor) => form.setValue('actividad_id', valor, { shouldValidate: true })}
        placeholder={
          catalogosCargando ? 'Cargando actividades...' : 'Sin imputar todavía (opcional)'
        }
        opciones={(actividades.data ?? []).map((actividad) => ({
          valor: String(actividad.id),
          etiqueta: actividad.objetivo,
          secundario: `#${actividad.id}`,
        }))}
        error={formState.errors.actividad_id?.message}
        descripcion="Se puede imputar ahora o al aprobar la propuesta."
      />

      <CampoTextarea
        id="propuesta-descripcion"
        label="Descripción"
        placeholder="Opcional. Detalle de lo que propone la organización"
        disabled={formState.isSubmitting}
        error={formState.errors.descripcion?.message}
        {...register('descripcion')}
      />
    </FormDialog>
  )
}