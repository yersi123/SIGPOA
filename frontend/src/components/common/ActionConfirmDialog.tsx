import { ConfirmDialog } from './ConfirmDialog'

export type ActionConfirmDialogVariant = 'default' | 'warning' | 'danger' | 'info' | 'success'

interface ActionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  actionText?: string
  cancelText?: string
  icon?: React.ReactNode
  variant?: ActionConfirmDialogVariant
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  confirmDisabled?: boolean
}

export function ActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionText = 'Confirmar',
  cancelText = 'Cancelar',
  icon,
  variant = 'warning',
  onConfirm,
  isLoading = false,
  confirmDisabled = false,
}: ActionConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={actionText}
      cancelText={cancelText}
      variant={variant}
      icon={icon}
      onConfirm={onConfirm}
      isLoading={isLoading}
      confirmDisabled={confirmDisabled}
    />
  )
}
