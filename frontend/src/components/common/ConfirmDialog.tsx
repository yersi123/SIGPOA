import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

export type ConfirmDialogVariant = 'default' | 'warning' | 'danger' | 'info' | 'success'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  icon?: React.ReactNode
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  confirmDisabled?: boolean
}

const variantConfig: Record<
  ConfirmDialogVariant,
  { icon: React.ElementType; actionClass?: string }
> = {
  default: { icon: Info },
  info: { icon: Info },
  success: { icon: CheckCircle2, actionClass: 'bg-green-600 hover:bg-green-700' },
  warning: { icon: AlertTriangle, actionClass: 'bg-amber-600 hover:bg-amber-700' },
  danger: { icon: AlertCircle, actionClass: 'bg-red-600 hover:bg-red-700' },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  icon,
  onConfirm,
  isLoading = false,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon ?? <Icon className="h-5 w-5 text-muted-foreground" />}
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="text-left pt-2">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || confirmDisabled}
            className={cn(config.actionClass)}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
