import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

import { ActionConfirmDialog } from '@/components/common/ActionConfirmDialog'
import { leerErrorApi } from '@/lib/api-errores'
import api from '@/lib/api'
import type { Gestion } from '@/types/gestion'

interface GestionCerrarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gestion: Gestion | null
}

/**
 * Cierre de una gestion (tarea 3.2), la accion critica del modulo.
 *
 * Llama a `POST /gestiones/{id}/cerrar`, que ejecuta sp_cerrar_gestion en el
 * backend y deja la gestion en estado cerrada: a partir de ahi la regla R4
 * impide registrar gastos y no se admiten actividades ni propuestas en ese
 * anio. Por eso el aviso es de tipo warning y se ofrece solo al administrador
 * con la gestion todavia abierta.
 */
export function GestionCerrarDialog({ open, onOpenChange, gestion }: GestionCerrarDialogProps) {
  const queryClient = useQueryClient()

  const cerrar = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/gestiones/${id}/cerrar`, undefined, { skipGlobalToast: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestiones'] })
      toast.success('Gestión cerrada correctamente.')
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const { status, message } = leerErrorApi(error)

      if (status === 403) {
        toast.error('No tienes permiso para cerrar gestiones.')
        return
      }

      // Los 422 llegan del trigger (P0001) traducidos por el backend.
      toast.error(message ?? 'No se pudo cerrar la gestión.')
    },
  })

  return (
    <ActionConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Cerrar la gestión ${gestion?.anio ?? ''}`.trim()}
      description="La gestión quedará en estado cerrada de forma permanente: ya no se podrán registrar gastos, actividades ni propuestas en este año (R4). Esta acción no se puede deshacer."
      actionText="Cerrar gestión"
      icon={<Lock className="h-4 w-4" />}
      variant="warning"
      isLoading={cerrar.isPending}
      onConfirm={() => {
        if (gestion) cerrar.mutate(gestion.id)
      }}
    />
  )
}
