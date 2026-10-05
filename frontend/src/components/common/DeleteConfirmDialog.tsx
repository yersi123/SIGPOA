import { ConfirmDialog } from './ConfirmDialog'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceName?: string
  resourceLabel?: string
  itemName?: string
  description?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  resourceName,
  resourceLabel = 'registro',
  itemName,
  description,
  onConfirm,
  isLoading = false,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}: DeleteConfirmDialogProps) {
  const finalDescription =
    description ??
    (itemName
      ? `¿Estás seguro de eliminar "${itemName}"? Esta acción no se puede deshacer.`
      : `¿Estás seguro de eliminar este ${resourceLabel}? Esta acción no se puede deshacer.`)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={resourceName ? `Eliminar ${resourceName}` : 'Eliminar registro'}
      description={finalDescription}
      confirmText={confirmText}
      cancelText={cancelText}
      variant="danger"
      icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}
