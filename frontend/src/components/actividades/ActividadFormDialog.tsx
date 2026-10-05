import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { CampoTextarea } from '@/components/common/campos/CampoTextarea'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import {
  useGestionesLookup,
  useOrganizacionesLookup,
  usePartidasLookup,
  useUnidadesLookup,
} from '@/hooks/useLookups'
import type {
  Actividad,
  ActividadFormData,
  ActividadFormValues,
} from '@/types/actividad'

/**
 * Limites de ActividadRequest. gestion_id, unidad_id, partida_id, objetivo y
 * monto_programado son obligatorios; organizacion_id, meta y descripcion no.
 *
 * El monto se valida como texto y se convierte al construir el cuerpo: asi no
 * se pierde el decimal al parsearlo en cada pulsacion.
 */
const actividadSchema = z.object({
  gestion_id: z.string().min(1, 'Selecciona la gestión'),
  unidad_id: z.string().min(1, 'Selecciona la unidad responsable'),
  partida_id: z.string().min(1, 'Selecciona la partida presupuestaria'),
  organizacion_id: z.string().optional(),
  objetivo: z
    .string()
    .trim()
    .min(1, 'El objetivo es obligatorio')
    .max(200, 'El objetivo no puede superar los 200 caracteres'),
  meta: z
    .string()
    .trim()
    .max(200, 'La meta no puede superar los 200 caracteres')
    .optional(),
  descripcion: z.string().trim().optional(),
  monto_programado: z
    .string()
    .trim()
    .min(1, 'El monto programado es obligatorio')
    .refine((valor) => !Number.isNaN(Number(valor)), 'El monto debe ser un número')
    .refine((valor) => Number(valor) >= 0, 'El monto no puede ser negativo'),
})

const CAMPOS_MAPEABLES = [
  'gestion_id',
  'unidad_id',
  'partida_id',
  'organizacion_id',
  'objetivo',
  'meta',
  'descripcion',
  'monto_programado',
] as const

/** Convierte el '' del desplegable opcional en el null que espera la API. */
function idONulo(valor: string): number | null {
  return valor.trim() === '' ? null : Number(valor)
}

interface ActividadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Si viene, el dialogo edita; si es null, crea. */
  actividad: Actividad | null
  onSaved: (actividad: Actividad) => void
}

/**
 * FormDialog de alta y edicion de una actividad del POA (tarea 9.1).
 *
 * Los desplegables de unidad, partida y organizacion se alimentan de consultas
 * aparte porque ActividadResource no expone las relaciones anidadas.
 */
export function ActividadFormDialog({
  open,
  onOpenChange,
  actividad,
  onSaved,
}: ActividadFormDialogProps) {
  const esEdicion = actividad !== null

  // Los catalogos solo se piden mientras el dialogo esta abierto.
  const cargarCatalogos = open
  const gestiones = useGestionesLookup(cargarCatalogos)
  const unidades = useUnidadesLookup(cargarCatalogos)
  const partidas = usePartidasLookup(cargarCatalogos)
  const organizaciones = useOrganizacionesLookup(cargarCatalogos)

  const form = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema) as never,
    defaultValues: {
      gestion_id: actividad ? String(actividad.gestion_id) : '',
      unidad_id: actividad ? String(actividad.unidad_id) : '',
      partida_id: actividad ? String(actividad.partida_id) : '',
      organizacion_id: actividad?.organizacion_id ? String(actividad.organizacion_id) : '',
      objetivo: actividad?.objetivo ?? '',
      meta: actividad?.meta ?? '',
      descripcion: actividad?.descripcion ?? '',
      monto_programado:
        actividad?.monto_programado === null || actividad?.monto_programado === undefined
          ? ''
          : String(actividad.monto_programado),
    },
    mode: 'onBlur',
  })

  const { register, control, formState } = form

  // useWatch en vez de form.watch: el valor llega solo al campo que lo usa y no
  // se recompone todo el dialogo en cada pulsacion del teclado.
  const gestionId = useWatch({ control, name: 'gestion_id' })
  const unidadId = useWatch({ control, name: 'unidad_id' })
  const partidaId = useWatch({ control, name: 'partida_id' })
  const organizacionId = useWatch({ control, name: 'organizacion_id' })

  // Los valores iniciales se calculan en el render: la pagina remonta el
  // dialogo con key={actividad.id} en cada cambio de registro en edicion.
  const { onSubmit, errorGlobal } = useGuardarRecurso<ActividadFormValues, Actividad>({
    form,
    ruta: '/actividades',
    id: actividad?.id ?? null,
    aPayload: (valores): ActividadFormData => ({
      gestion_id: Number(valores.gestion_id),
      unidad_id: Number(valores.unidad_id),
      partida_id: Number(valores.partida_id),
      organizacion_id: idONulo(valores.organizacion_id),
      objetivo: valores.objetivo.trim(),
      meta: valores.meta?.trim() ? valores.meta.trim() : null,
      descripcion: valores.descripcion?.trim() ? valores.descripcion.trim() : null,
      monto_programado: Number(valores.monto_programado),
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: esEdicion ? 'Actividad actualizada correctamente.' : 'Actividad creada correctamente.',
    clave: 'actividades',
    sinPermiso: 'No tienes permiso para guardar esta actividad.',
    generico: 'No se pudo guardar la actividad. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  const catalogosCargando =
    gestiones.isPending || unidades.isPending || partidas.isPending || organizaciones.isPending

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar Actividad' : 'Nueva Actividad'}
      description={
        esEdicion
          ? 'Modifica los datos de la actividad del POA.'
          : 'Registra una actividad nueva en la gestión seleccionada.'
      }
      maxWidth="lg"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText={esEdicion ? 'Guardar cambios' : 'Crear actividad'}
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          id="actividad-gestion"
          label="Gestión"
          obligatorio
          valor={gestionId}
          onValorChange={(valor) => form.setValue('gestion_id', valor, { shouldValidate: true })}
          placeholder={catalogosCargando ? 'Cargando catálogos...' : 'Selecciona la gestión'}
          opciones={(gestiones.data ?? []).map((gestion) => ({
            valor: String(gestion.id),
            etiqueta: `${gestion.anio}`,
            secundario: String(gestion.anio),
            disabled: gestion.estado === 'cerrada',
          }))}
          error={formState.errors.gestion_id?.message}
          descripcion="Las gestores cerradas no admiten actividades nuevas."
        />

        <CampoSelect
          id="actividad-unidad"
          label="Unidad responsable"
          obligatorio
          valor={unidadId}
          onValorChange={(valor) => form.setValue('unidad_id', valor, { shouldValidate: true })}
          placeholder={catalogosCargando ? 'Cargando catálogos...' : 'Selecciona la unidad'}
          opciones={(unidades.data ?? []).map((unidad) => ({
            valor: String(unidad.id),
            etiqueta: unidad.nombre,
          }))}
          error={formState.errors.unidad_id?.message}
        />

        <CampoSelect
          id="actividad-partida"
          label="Partida presupuestaria"
          obligatorio
          valor={partidaId}
          onValorChange={(valor) => form.setValue('partida_id', valor, { shouldValidate: true })}
          placeholder={catalogosCargando ? 'Cargando catálogos...' : 'Selecciona la partida'}
          opciones={(partidas.data ?? []).map((partida) => ({
            valor: String(partida.id),
            etiqueta: partida.nombre,
            secundario: partida.codigo,
          }))}
          error={formState.errors.partida_id?.message}
        />

        <CampoSelect
          id="actividad-organizacion"
          label="Organización"
          valor={organizacionId}
          onValorChange={(valor) =>
            form.setValue('organizacion_id', valor, { shouldValidate: true })
          }
          placeholder="Sin organización (opcional)"
          opciones={(organizaciones.data ?? []).map((organizacion) => ({
            valor: String(organizacion.id),
            etiqueta: organizacion.nombre,
          }))}
          error={formState.errors.organizacion_id?.message}
          descripcion="Se llena cuando la actividad proviene de una propuesta participativa."
        />
      </div>

      <CampoTexto
        id="actividad-objetivo"
        label="Objetivo"
        obligatorio
        placeholder="Ej. Construcción de cancha polifuncional"
        disabled={formState.isSubmitting}
        error={formState.errors.objetivo?.message}
        {...register('objetivo')}
      />

      <CampoTexto
        id="actividad-meta"
        label="Meta"
        placeholder="Opcional. Ej. 1 cancha construida"
        disabled={formState.isSubmitting}
        error={formState.errors.meta?.message}
        {...register('meta')}
      />

      <CampoTexto
        id="actividad-monto"
        label="Monto programado (Bs)"
        obligatorio
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        placeholder="Ej. 150000.00"
        disabled={formState.isSubmitting}
        error={formState.errors.monto_programado?.message}
        descripcion="No puede ser negativo."
        {...register('monto_programado')}
      />

      <CampoTextarea
        id="actividad-descripcion"
        label="Descripción"
        placeholder="Opcional. Detalle de la obra o del servicio"
        disabled={formState.isSubmitting}
        error={formState.errors.descripcion?.message}
        {...register('descripcion')}
      />
    </FormDialog>
  )
}