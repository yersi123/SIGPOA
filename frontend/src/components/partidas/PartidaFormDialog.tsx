import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import type { Partida, PartidaFormData, PartidaFormValues } from '@/types/partida'

/**
 * El backend exige 5 o 6 digitos por el CHECK ck_partidas_codigo y responde 422
 * con un mensaje propio cuando no se cumple. La misma regla se replica aqui
 * para que el error aparezca bajo el campo y no como toast.
 */
const partidaSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio')
    .regex(/^\d{5,6}$/, 'El código debe tener 5 o 6 dígitos, según el CHECK de la base de datos'),
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'El nombre no puede superar los 120 caracteres'),
})

const CAMPOS_MAPEABLES = ['codigo', 'nombre'] as const

interface PartidaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Si viene, el dialogo edita; si es null, crea. */
  partida: Partida | null
  onSaved: (partida: Partida) => void
}

/** FormDialog de alta y edicion de una partida presupuestaria (tarea 6.1). */
export function PartidaFormDialog({ open, onOpenChange, partida, onSaved }: PartidaFormDialogProps) {
  const esEdicion = partida !== null

  const form = useForm<PartidaFormValues>({
    resolver: zodResolver(partidaSchema) as never,
    defaultValues: {
      codigo: partida?.codigo ?? '',
      nombre: partida?.nombre ?? '',
    },
    mode: 'onBlur',
  })

  const { register, formState } = form

  // Los valores iniciales se calculan en el render: la pagina remonta el
  // dialogo con key={partida.id} cada vez que cambia el registro en edicion.
  const { onSubmit, errorGlobal } = useGuardarRecurso<PartidaFormValues, Partida>({
    form,
    ruta: '/partidas',
    id: partida?.id ?? null,
    aPayload: (valores): PartidaFormData => ({
      codigo: valores.codigo.trim(),
      nombre: valores.nombre.trim(),
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: esEdicion ? 'Partida actualizada correctamente.' : 'Partida creada correctamente.',
    clave: 'partidas',
    sinPermiso: 'No tienes permiso para guardar esta partida.',
    generico: 'No se pudo guardar la partida. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar Partida' : 'Nueva Partida'}
      description={
        esEdicion
          ? 'Modifica los datos de la partida presupuestaria.'
          : 'Registra una partida presupuestaria nueva.'
      }
      maxWidth="md"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText={esEdicion ? 'Guardar cambios' : 'Crear partida'}
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <CampoTexto
        id="partida-codigo"
        label="Código"
        obligatorio
        inputMode="numeric"
        maxLength={6}
        placeholder="Ej. 25100"
        disabled={formState.isSubmitting}
        error={formState.errors.codigo?.message}
        descripcion="5 o 6 dígitos, según el CHECK ck_partidas_codigo."
        {...register('codigo')}
      />

      <CampoTexto
        id="partida-nombre"
        label="Nombre"
        obligatorio
        placeholder="Ej. Consultorías por producto"
        disabled={formState.isSubmitting}
        error={formState.errors.nombre?.message}
        {...register('nombre')}
      />
    </FormDialog>
  )
}