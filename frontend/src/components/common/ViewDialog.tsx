import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type ViewDialogMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

interface ViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: ViewDialogMaxWidth
  hideClose?: boolean
  closeOnOverlayClick?: boolean
}

const maxWidthClasses: Record<ViewDialogMaxWidth, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-[95vw]',
}

export function ViewDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'lg',
  hideClose = false,
  closeOnOverlayClick = true,
}: ViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className={cn('p-0 flex flex-col gap-0 max-h-[90vh] overflow-hidden', maxWidthClasses[maxWidth])}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) e.preventDefault()
        }}
        showCloseButton={!hideClose}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
