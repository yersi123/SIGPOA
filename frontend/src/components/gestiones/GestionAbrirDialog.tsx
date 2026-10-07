import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Unlock } from 'lucide-react'
import { toast } from 'sonner'

import { ActionConfirmDialog } from '@/components/common/ActionConfirmDialog'
import api from '@/lib/api'
import { leerErrorApi } from '@/lib/api-errores'
import type { Gestion } from '@/types/gestion'

interface GestionAbrirDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gestion: Gestion | null
}

/**
 * Activacion de una gestion (POST /gestiones/:id/abrir).
 *
 * Solo puede haber una gestion abierta a la vez: si ya hay otra, el backend
 * responde 422 con el año de la que sigue abierta, para cerrarla primero.
 */
export function GestionAbrirDialog({
  open,
  onOpenChange,
  gestion,
}: GestionAbrirDialogProps) {
  const queryClient = useQueryClient()

  const mutacion = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/gestiones/${id}/abrir`, null, { skipGlobalToast: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestiones'] })
      onOpenChange(false)
      toast.success('Gestión activada. Ya se pueden registrar actividades y gastos.')
    },
    onError: (error: unknown) => {
      const { status, errors } = leerErrorApi(error)

      const detalle = errors?.estado?.[0]

      if (detalle) {
        toast.error(detalle)
        return
      }

      toast.error(
        status === 403
          ? 'No tienes permiso para activar esta gestión.'
          : 'No se pudo activar la gestión. Inténtalo de nuevo.',
      )
    },
  })

  return (
    <ActionConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={gestion ? `Activar la gestión ${gestion.anio}` : 'Activar gestión'}
      description="La gestión quedará abierta y se podrán registrar actividades y gastos. Recuerda que solo puede haber una gestión abierta a la vez."
      actionText="Activar gestión"
      icon={<Unlock className="h-4 w-4" />}
      variant="success"
      isLoading={mutacion.isPending}
      onConfirm={() => {
        if (gestion) mutacion.mutate(gestion.id)
      }}
    />
  )
}