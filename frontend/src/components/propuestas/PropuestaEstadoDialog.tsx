import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { ActionConfirmDialog } from '@/components/common/ActionConfirmDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { CampoTexto } from '@/components/common/campos/CampoTexto'
import { etiquetaEstado } from '@/lib/estados'
import { FormDialog } from '@/components/common/FormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  montoDisponible,
  requiereImputacion,
  siguienteEstadoPropuesta,
  useAccionesPropuesta,
} from '@/hooks/useAccionesPropuesta'
import { useActividadesLookup, usePropuestasLookup } from '@/hooks/useLookups'
import { aNumero, formatearMoneda } from '@/lib/formato'
import type { Propuesta } from '@/types/propuesta'

/**
 * Al aprobar, el monto no puede ser 0 ni exceder lo que le queda libre a la
 * actividad: sp_cambiar_estado_propuesta rechaza las dos cosas con 422.
 */
const imputacionSchema = z.object({
  actividad_id: z.string().min(1, 'Selecciona la actividad del POA que financia la propuesta'),
  monto: z
    .string()
    .trim()
    .min(1, 'El monto asignado es obligatorio')
    .refine((valor) => !Number.isNaN(Number(valor)), 'El monto debe ser un número')
    .refine((valor) => Number(valor) > 0, 'El monto debe ser mayor a 0'),
})

type ImputacionValues = z.infer<typeof imputacionSchema>

interface PropuestaEstadoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propuesta: Propuesta | null
}

/**
 * Cambio de estado de una propuesta (tarea 12.2).
 *
 * El ciclo es de un solo sentido (propuesto -> aprobado -> en_ejecucion ->
 * concluido). Solo el paso a aprobado necesita formulario, porque R5 exige
 * imputar la propuesta a una actividad del POA con un monto; el resto se
 * confirma con un solo clic.
 *
 * El monto offered se limita a lo que la actividad tiene libre: la base no
 * admite que la suma de lo asignado supere lo programado, y avisar aqui evita
 * un 422 sin salida.
 */
export function PropuestaEstadoDialog({
  open,
  onOpenChange,
  propuesta,
}: PropuestaEstadoDialogProps) {
  const acciones = useAccionesPropuesta()

  const necesitaImputacion = requiereImputacion(propuesta?.estado ?? 'propuesto')
  const siguiente = propuesta ? siguienteEstadoPropuesta(propuesta.estado) : null

  const actividades = useActividadesLookup(open && necesitaImputacion)
  const propuestas = usePropuestasLookup(open && necesitaImputacion)

  const form = useForm<ImputacionValues>({
    resolver: zodResolver(imputacionSchema) as never,
    defaultValues: {
      actividad_id: propuesta?.actividad_id ? String(propuesta.actividad_id) : '',
      monto:
        propuesta?.monto_asignado !== undefined && aNumero(propuesta.monto_asignado) > 0
          ? String(propuesta.monto_asignado)
          : '',
    },
    mode: 'onBlur',
  })

  const { register, control, formState, setError, clearErrors } = form
  const actividadId = useWatch({ control, name: 'actividad_id' })

  const actividadElegida = useMemo(
    () => (actividades.data ?? []).find((actividad) => actividad.id === Number(actividadId)),
    [actividades.data, actividadId],
  )

  // Margen libre de la actividad elegida, sin contar esta misma propuesta.
  const libre = useMemo(
    () =>
      montoDisponible(
        Number(actividadId) || null,
        actividadElegida?.monto_programado,
        propuestas.data ?? [],
        propuesta?.id,
      ),
    [actividadId, actividadElegida, propuestas.data, propuesta?.id],
  )

  const hayMargen = libre > 0

  const cerrar = () => onOpenChange(false)

  /** Avance simple: sin formulario, solo el estado. */
  const confirmarSinImputacion = async () => {
    if (!propuesta || !siguiente) return
    await acciones.cambiarEstado.mutateAsync({ id: propuesta.id, estado: siguiente })
    cerrar()
  }

  const confirmarAprobacion = async (valores: ImputacionValues) => {
    if (!propuesta || !siguiente) return

    const monto = Number(valores.monto)

    if (monto > libre) {
      setError('monto', {
        message: `La actividad solo tiene ${formatearMoneda(libre)} libres de lo programado.`,
      })
      return
    }

    await acciones.cambiarEstado.mutateAsync({
      id: propuesta.id,
      estado: siguiente,
      actividad_id: Number(valores.actividad_id),
      monto,
    })

    clearErrors()
    cerrar()
  }

  if (!necesitaImputacion) {
    return (
      <ActionConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title={
          siguiente ? `Pasar a ${etiquetaEstado(siguiente)}` : 'Cambio de estado'
        }
        description={
          propuesta && siguiente
            ? `"${propuesta.titulo}" pasará de ${etiquetaEstado(propuesta.estado)} a ${etiquetaEstado(siguiente)}. El avance es de un solo sentido y no se puede deshacer.`
            : undefined
        }
        actionText="Confirmar"
        icon={<ArrowRight className="h-4 w-4" />}
        variant="warning"
        isLoading={acciones.enCurso}
        onConfirm={confirmarSinImputacion}
      />
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Aprobar la propuesta"
      description="Para aprobar hay que imputarla a una actividad del POA con su monto."
      maxWidth="lg"
      form={form}
      onSubmit={confirmarAprobacion}
      loading={formState.isSubmitting}
      submitText="Aprobar propuesta"
    >
      <Alert>
        <AlertDescription className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            La suma de los montos asignados a una actividad no puede superar lo programado. El
            campo monto se limita a lo que quede libre.
          </span>
        </AlertDescription>
      </Alert>

      <CampoSelect
        id="propuesta-estado-actividad"
        label="Actividad del POA"
        obligatorio
        valor={actividadId ?? ''}
        onValorChange={(valor) => form.setValue('actividad_id', valor, { shouldValidate: true })}
        placeholder={actividades.isPending ? 'Cargando actividades...' : 'Selecciona la actividad'}
        opciones={(actividades.data ?? []).map((actividad) => ({
          valor: String(actividad.id),
          etiqueta: actividad.objetivo,
          secundario: formatearMoneda(actividad.monto_programado),
        }))}
        error={formState.errors.actividad_id?.message}
        descripcion={
          actividadElegida
            ? `Programado: ${formatearMoneda(actividadElegida.monto_programado)}. Libre: ${formatearMoneda(Math.max(libre, 0))}.`
            : undefined
        }
      />

      <CampoTexto
        id="propuesta-estado-monto"
        label="Monto asignado (Bs)"
        type="number"
        step="0.01"
        min="0.01"
        inputMode="decimal"
        placeholder="Ej. 25000.00"
        obligatorio
        disabled={formState.isSubmitting}
        error={formState.errors.monto?.message}
        descripcion={
          Number(actividadId) && !hayMargen
            ? 'Esta actividad ya tiene todo su monto programado asignado.'
            : 'Debe ser mayor a 0.'
        }
        {...register('monto')}
      />

      {Number(actividadId) && !hayMargen && (
        <Alert variant="destructive">
          <AlertDescription>
            Elige otra actividad: los montos ya asignados a esta alcanzan su monto programado.
          </AlertDescription>
        </Alert>
      )}
    </FormDialog>
  )
}