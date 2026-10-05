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
  ORGANIZACION_TIPO_LABELS,
  TIPOS_ORGANIZACION,
  type Organizacion,
  type OrganizacionFormData,
  type OrganizacionFormValues,
  type TipoOrganizacion,
} from '@/types/organizacion'

/**
 * El backend normaliza el tipo con TipoOrganizacion::fromLabel() antes de
 * validar, asi que acepta OTB y otb indistintamente y guarda el valor canonico.
 * El desplegable envia siempre el canonico, que es lo que espera el CHECK.
 */
const organizacionSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  tipo: z.enum(TIPOS_ORGANIZACION, {
    error: 'Selecciona el tipo de organización',
  }),
  personeria_juridica: z
    .string()
    .trim()
    .max(50, 'La personería jurídica no puede superar los 50 caracteres')
    .optional(),
  representante: z
    .string()
    .trim()
    .max(120, 'El representante no puede superar los 120 caracteres')
    .optional(),
  telefono: z
    .string()
    .trim()
    .max(20, 'El teléfono no puede superar los 20 caracteres')
    .optional(),
  direccion: z
    .string()
    .trim()
    .max(200, 'La dirección no puede superar los 200 caracteres')
    .optional(),
})

const CAMPOS_MAPEABLES = [
  'nombre',
  'tipo',
  'personeria_juridica',
  'representante',
  'telefono',
  'direccion',
] as const

/** El '' solo existe para que el desplegable pueda mostrar su placeholder. */
function esTipoCanonico(valor: string): valor is TipoOrganizacion {
  return valor !== '' && (TIPOS_ORGANIZACION as readonly string[]).includes(valor)
}

interface OrganizacionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Si viene, el dialogo edita; si es null, crea. */
  organizacion: Organizacion | null
  onSaved: (organizacion: Organizacion) => void
}

/** FormDialog de alta y edicion de una organización (tarea 8.1). */
export function OrganizacionFormDialog({
  open,
  onOpenChange,
  organizacion,
  onSaved,
}: OrganizacionFormDialogProps) {
  const esEdicion = organizacion !== null

  const form = useForm<OrganizacionFormValues>({
    resolver: zodResolver(organizacionSchema) as never,
    defaultValues: {
      nombre: organizacion?.nombre ?? '',
      tipo: organizacion?.tipo ?? '',
      personeria_juridica: organizacion?.personeria_juridica ?? '',
      representante: organizacion?.representante ?? '',
      telefono: organizacion?.telefono ?? '',
      direccion: organizacion?.direccion ?? '',
    },
    mode: 'onBlur',
  })

  const { register, control, formState } = form

  // useWatch en vez de form.watch: el valor llega solo al componente que lo usa
  // y no se recompone todo el dialogo en cada pulsacion del teclado.
  const tipoSeleccionado = useWatch({ control, name: 'tipo' })

  // Los valores iniciales se calculan en el render: la pagina remonta el
  // dialogo con key={organizacion.id} en cada cambio de registro en edicion.
  const { onSubmit, errorGlobal } = useGuardarRecurso<OrganizacionFormValues, Organizacion>({
    form,
    ruta: '/organizaciones',
    id: organizacion?.id ?? null,
    aPayload: (valores): OrganizacionFormData => ({
      nombre: valores.nombre.trim(),
      // El esquema de zod ya exige un tipo canonico, asi que la rama de abajo
      // solo existe para contentar al analizador de tipos.
      tipo: esTipoCanonico(valores.tipo) ? valores.tipo : 'OTB',
      personeria_juridica: valores.personeria_juridica?.trim()
        ? valores.personeria_juridica.trim()
        : null,
      representante: valores.representante?.trim() ? valores.representante.trim() : null,
      telefono: valores.telefono?.trim() ? valores.telefono.trim() : null,
      direccion: valores.direccion?.trim() ? valores.direccion.trim() : null,
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: esEdicion
      ? 'Organización actualizada correctamente.'
      : 'Organización creada correctamente.',
    clave: 'organizaciones',
    sinPermiso: 'No tienes permiso para guardar esta organización.',
    generico: 'No se pudo guardar la organización. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar Organización' : 'Nueva Organización'}
      description={
        esEdicion
          ? 'Modifica los datos de la organización social.'
          : 'Registra una organización social nueva.'
      }
      maxWidth="md"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText={esEdicion ? 'Guardar cambios' : 'Crear organización'}
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <CampoTexto
        id="organizacion-nombre"
        label="Nombre"
        obligatorio
        placeholder="Ej. Junta Vecinal Villa Esperanza"
        disabled={formState.isSubmitting}
        error={formState.errors.nombre?.message}
        {...register('nombre')}
      />

      <CampoSelect
        id="organizacion-tipo"
        label="Tipo"
        obligatorio
        valor={tipoSeleccionado}
        onValorChange={(valor) => form.setValue('tipo', valor as TipoOrganizacion, {
          shouldValidate: true,
        })}
        placeholder="Selecciona el tipo"
        opciones={TIPOS_ORGANIZACION.map((valor) => ({
          valor,
          etiqueta: ORGANIZACION_TIPO_LABELS[valor],
        }))}
        error={formState.errors.tipo?.message}
      />

      <CampoTexto
        id="organizacion-personeria"
        label="Personería jurídica"
        placeholder="Opcional. Ej. RES-ADM-001/2020"
        disabled={formState.isSubmitting}
        error={formState.errors.personeria_juridica?.message}
        descripcion="Es única: si se repite, la base de datos rechaza el alta con un 409."
        {...register('personeria_juridica')}
      />

      <CampoTexto
        id="organizacion-representante"
        label="Representante"
        placeholder="Opcional. Ej. María Quispe"
        disabled={formState.isSubmitting}
        error={formState.errors.representante?.message}
        {...register('representante')}
      />

      <CampoTexto
        id="organizacion-telefono"
        label="Teléfono"
        placeholder="Opcional. Ej. 3-5551234"
        disabled={formState.isSubmitting}
        error={formState.errors.telefono?.message}
        {...register('telefono')}
      />

      <CampoTextarea
        id="organizacion-direccion"
        label="Dirección"
        placeholder="Opcional. Ej. Av. Siempre Viva 742"
        disabled={formState.isSubmitting}
        error={formState.errors.direccion?.message}
        {...register('direccion')}
      />
    </FormDialog>
  )
}