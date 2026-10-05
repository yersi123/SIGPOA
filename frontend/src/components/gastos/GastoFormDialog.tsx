import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { CampoTextarea } from '@/components/common/campos/CampoTextarea'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuardarRecurso } from '@/hooks/useGuardarRecurso'
import { useProveedoresLookup } from '@/hooks/useLookups'
import type { Gasto, GastoFormData } from '@/types/gasto'

/**
 * Limites de GastoRequest.
 *
 * actividad_id, fecha y monto son obligatorios; proveedor_id y detalle no.
 * El monto lleva `gt:0`, o sea estrictamente mayor que cero: un gasto de cero no
 * lo acepta ni el backend ni este esquema.
 *
 * El alta la ejecuta sp_registrar_gasto, que es la que aplica R4 y rechaza el
 * gasto cuando la gestion de la actividad esta cerrada.
 */
const gastoSchema = z.object({
  proveedor_id: z.string().optional(),
  fecha: z.string().min(1, 'La fecha del gasto es obligatoria'),
  monto: z
    .string()
    .trim()
    .min(1, 'El monto es obligatorio')
    .refine((valor) => !Number.isNaN(Number(valor)), 'El monto debe ser un número')
    .refine((valor) => Number(valor) > 0, 'El monto debe ser mayor a 0'),
  detalle: z
    .string()
    .trim()
    .max(250, 'El detalle no puede superar los 250 caracteres')
    .optional(),
})

type GastoFormValues = z.infer<typeof gastoSchema>

const CAMPOS_MAPEABLES = ['proveedor_id', 'fecha', 'monto', 'detalle'] as const

/** Convierte el '' del desplegable opcional en el null que espera la API. */
function idONulo(valor?: string): number | null {
  return valor?.trim() ? Number(valor) : null
}

/**
 * Fecha de hoy para el valor por defecto.
 *
 * Se calcula una sola vez al cargar el modulo y no dentro del render: si se
 * pidiera `new Date()` al construir los defaultValues, cualquier re-render
 * devolveria una fecha distinta y el valor por defecto ya no seria estable.
 */
const FECHA_HOY = new Date().toISOString().slice(0, 10)

interface GastoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Actividad a la que se carga el gasto. No es editable: el gasto pertenece a una sola. */
  actividadId: number
  actividadObjetivo: string
  gestionAnio?: number
  /** Permite avisar antes de intentar el registro cuando la gestion ya esta cerrada. */
  gestionCerrada: boolean
  onSaved: (gasto: Gasto) => void
}

/**
 * Alta de un gasto de una actividad (tareas 10.2 y 10.4).
 *
 * No hay edicion a proposito: el backend solo expone POST y DELETE para gastos,
 * y la tarea 10.1 pide que no sean editables.
 */
export function GastoFormDialog({
  open,
  onOpenChange,
  actividadId,
  actividadObjetivo,
  gestionAnio,
  gestionCerrada,
  onSaved,
}: GastoFormDialogProps) {
  // El catalogo de proveedores solo se pide con el dialogo abierto.
  const proveedores = useProveedoresLookup(open)

  const form = useForm<GastoFormValues>({
    resolver: zodResolver(gastoSchema) as never,
    defaultValues: {
      proveedor_id: '',
      fecha: FECHA_HOY,
      monto: '',
      detalle: '',
    },
    mode: 'onBlur',
  })

  const { register, control, formState } = form

  // useWatch en vez de form.watch: el valor llega solo al desplegable que lo usa.
  const proveedorId = useWatch({ control, name: 'proveedor_id' })

  const { onSubmit, errorGlobal } = useGuardarRecurso<GastoFormValues, Gasto>({
    form,
    ruta: '/gastos',
    id: null,
    aPayload: (valores): GastoFormData => ({
      actividad_id: actividadId,
      proveedor_id: idONulo(valores.proveedor_id),
      fecha: valores.fecha,
      monto: Number(valores.monto),
      detalle: valores.detalle?.trim() ? valores.detalle.trim() : null,
    }),
    camposMapeables: CAMPOS_MAPEABLES,
    exito: 'Gasto registrado correctamente.',
    clave: 'gastos',
    sinPermiso: 'Solo el administrador puede registrar gastos.',
    generico: 'No se pudo registrar el gasto. Inténtalo de nuevo.',
    alGuardar: onSaved,
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar gasto"
      description={`El gasto se imputa a la actividad "${actividadObjetivo}".`}
      maxWidth="lg"
      form={form}
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
      submitText="Registrar gasto"
    >
      {errorGlobal && (
        <Alert variant="destructive">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      {gestionCerrada && (
        <Alert>
          <AlertDescription>
            La gestión {gestionAnio} está cerrada. La base de datos rechazará el registro de este
            gasto (regla R4).
          </AlertDescription>
        </Alert>
      )}

      <CampoTexto
        id="gasto-actividad"
        label="Actividad"
        value={actividadObjetivo}
        readOnly
        disabled
        descripcion={
          gestionAnio ? `Gestión ${gestionAnio}. El gasto hereda la gestión de su actividad.` : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          id="gasto-fecha"
          label="Fecha del gasto"
          type="date"
          obligatorio
          disabled={formState.isSubmitting}
          error={formState.errors.fecha?.message}
          {...register('fecha')}
        />

        <CampoSelect
          id="gasto-proveedor"
          label="Proveedor"
          valor={proveedorId ?? ''}
          onValorChange={(valor) => form.setValue('proveedor_id', valor, { shouldValidate: true })}
          placeholder={proveedores.isPending ? 'Cargando...' : 'Sin proveedor (opcional)'}
          opciones={(proveedores.data ?? []).map((proveedor) => ({
            valor: String(proveedor.id),
            etiqueta: proveedor.nombre,
            secundario: proveedor.nit ?? undefined,
          }))}
          error={formState.errors.proveedor_id?.message}
          descripcion="Los gastos internos pueden registrarse sin proveedor."
        />

        <CampoTexto
          id="gasto-monto"
          label="Monto (Bs)"
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          placeholder="Ej. 12500.00"
          obligatorio
          disabled={formState.isSubmitting}
          error={formState.errors.monto?.message}
          descripcion="Debe ser mayor a 0."
          {...register('monto')}
        />
      </div>

      <CampoTextarea
        id="gasto-detalle"
        label="Detalle"
        placeholder="Opcional. Ej. Segundo desembolso de obra"
        disabled={formState.isSubmitting}
        error={formState.errors.detalle?.message}
        descripcion="Máximo 250 caracteres."
        {...register('detalle')}
      />
    </FormDialog>
  )
}