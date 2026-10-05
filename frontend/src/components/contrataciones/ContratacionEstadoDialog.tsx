import { Gavel, Send } from 'lucide-react'

import { ActionConfirmDialog } from '@/components/common/ActionConfirmDialog'
import { etiquetaEstado } from '@/lib/estados'
import { useAccionesContratacion, siguienteEstadoContratacion } from '@/hooks/useAccionesContratacion'
import type { Contratacion } from '@/types/contratacion'

interface ContratacionEstadoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contratacion: Contratacion | null
}

/**
 * Confirmacion del avance de estado de una contratacion (tareas 11.2 y 11.3).
 *
 * El paso a adjudicada no es un PATCH mas: va por `POST /contrataciones/{id}/adjudicar`,
 * que ejecuta sp_adjudicar_contratacion (R7). Aqui se decide cual de los dos
 * endpoints toca segun el estado de origen, de forma que quien lo usa no tenga
 * que saberlo.
 */
export function ContratacionEstadoDialog({
  open,
  onOpenChange,
  contratacion,
}: ContratacionEstadoDialogProps) {
  const acciones = useAccionesContratacion()

  const estadoActual = contratacion?.estado
  const siguiente = estadoActual ? siguienteEstadoContratacion(estadoActual) : null
  const esAdjudicacion = siguiente === 'adjudicada'

  const confirmar = async () => {
    if (!contratacion || !siguiente) return

    if (esAdjudicacion) {
      await acciones.adjudicar.mutateAsync(contratacion.id)
    } else {
      await acciones.cambiarEstado.mutateAsync({ id: contratacion.id, estado: siguiente })
    }

    onOpenChange(false)
  }

  return (
    <ActionConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        esAdjudicacion
          ? 'Adjudicar la contratación'
          : `Pasar a ${estadoActual && siguiente ? etiquetaEstado(siguiente) : ''}`
      }
      description={
        esAdjudicacion
          ? 'Se ejecutará el procedimiento de adjudicación, que fija la fecha de adjudicación y cierra el proceso. Esta acción no se puede deshacer.'
          : `La contratación pasará de ${estadoActual ? etiquetaEstado(estadoActual) : ''} a ${siguiente ? etiquetaEstado(siguiente) : ''}. El avance es de un solo sentido.`
      }
      actionText={esAdjudicacion ? 'Adjudicar' : 'Confirmar'}
      icon={esAdjudicacion ? <Gavel className="h-4 w-4" /> : <Send className="h-4 w-4" />}
      variant={esAdjudicacion ? 'success' : 'warning'}
      isLoading={acciones.enCurso}
      onConfirm={confirmar}
    />
  )
}