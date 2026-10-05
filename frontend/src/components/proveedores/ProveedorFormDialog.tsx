import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { CampoTextarea } from '@/components/common/campos/CampoTextarea'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import type { Proveedor, ProveedorFormData, ProveedorFormValues } from '@/types/proveedor'

/** Limites de ProveedorRequest. Solo el nombre es obligatorio. */
const proveedorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  nit: z
    .string()
    .trim()
    .max(20, 'El NIT no puede superar los 20 caracteres')
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

const CAMPOS_MAPEABLES = ['nombre', 'nit', 'telefono', 'direccion'] as const

interface ProveedorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Si viene, el dialogo edita; si es null, crea. */
  proveedor: Proveedor | null
  onSaved: (proveedor: Proveedor) => void
}

/** FormDialog de alta y edicion de un proveedor (tarea 7.1). */
export function ProveedorFormDialog({
  open,
  onOpenChange,
  proveedor,
  onSaved,
}: ProveedorFormDialogProps) {
  const esEdicion = proveedor !== null

  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema) as never,
    defaultValues: {
      nombre: proveedor?.nombre ?? '',
      nit: proveedor?.nit ?? '',
      telefono: proveedor?.telefono ?? '',
      direccion: proveedor?.direccion ?? '',
    },
    mode: 'onBlur',
  })

  const { register, formState } = form

  // Los valores iniciales se calculan en el render: la pagina remonta el
  // dialogo con key={proveedor.id} cada vez que cambia el registro en edicion.
  const { onSubmit, errorGlobal } = useGuardarRecurso<ProveedorFormValues, Proveedor>({
    form,
    ruta: '/proveedores',
    id: proveedor?.id ?? null,
    aPayload: (valores): ProveedorFormData => ({
      nombre: valores.nombre.trim(),
      nit: valores.nit?.trim() ? valores.nit.trim() : null,
      telefono: valores.telefono?.trim() ? valores.telefono.trim() : null,
      direccion: valores.direccion?.trim() ? valores.direccion.trim() : null,
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: esEdicion ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.',
    clave: 'proveedores',
    sinPermiso: 'No tienes permiso para guardar este proveedor.',
    generico: 'No se pudo guardar el proveedor. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      description={
        esEdicion
          ? 'Modifica los datos del proveedor y guarda los cambios.'
          : 'Registra un proveedor nuevo del sistema.'
      }
      maxWidth="md"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText={esEdicion ? 'Guardar cambios' : 'Crear proveedor'}
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <CampoTexto
        id="proveedor-nombre"
        label="Nombre o razón social"
        obligatorio
        placeholder="Ej. Constructora Andina S.R.L."
        disabled={formState.isSubmitting}
        error={formState.errors.nombre?.message}
        {...register('nombre')}
      />

      <CampoTexto
        id="proveedor-nit"
        label="NIT"
        placeholder="Opcional. Ej. 1023456019"
        disabled={formState.isSubmitting}
        error={formState.errors.nit?.message}
        descripcion="Si se repite, la base de datos rechazará el alta con un 409."
        {...register('nit')}
      />

      <CampoTexto
        id="proveedor-telefono"
        label="Teléfono"
        placeholder="Opcional. Ej. 3-5220001"
        disabled={formState.isSubmitting}
        error={formState.errors.telefono?.message}
        {...register('telefono')}
      />

      <CampoTextarea
        id="proveedor-direccion"
        label="Dirección"
        placeholder="Opcional. Ej. Av. Ballivián 1234"
        disabled={formState.isSubmitting}
        error={formState.errors.direccion?.message}
        {...register('direccion')}
      />
    </FormDialog>
  )
}