import { useEffect, useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type FormDialogMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

interface FormDialogProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  form: UseFormReturn<T>
  onSubmit: (values: T) => void | Promise<void>
  footer?: React.ReactNode
  maxWidth?: FormDialogMaxWidth
  closeOnOverlayClick?: boolean
  loading?: boolean
  disableEscapeKeyDown?: boolean
  warnOnUnsavedChanges?: boolean
  submitText?: string
  cancelText?: string
  hideDefaultFooter?: boolean
}

const maxWidthClasses: Record<FormDialogMaxWidth, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-[95vw]',
}

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  children,
  form,
  onSubmit,
  footer,
  maxWidth = 'lg',
  closeOnOverlayClick = false,
  loading = false,
  disableEscapeKeyDown = false,
  warnOnUnsavedChanges = true,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  hideDefaultFooter = false,
}: FormDialogProps<T>) {
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
  const isDirty = form.formState.isDirty
  const isSubmitting = form.formState.isSubmitting || loading

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && warnOnUnsavedChanges && isDirty && !isSubmitting) {
      setIsDiscardConfirmOpen(true)
      return
    }
    onOpenChange(nextOpen)
  }

  const handleDiscard = () => {
    form.reset()
    setIsDiscardConfirmOpen(false)
    onOpenChange(false)
  }

  const handleCancelDiscard = () => {
    setIsDiscardConfirmOpen(false)
  }

  const handleSubmit = async (values: T) => {
    await onSubmit(values)
  }

  useEffect(() => {
    if (!open) {
      setIsDiscardConfirmOpen(false)
    }
  }, [open])

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange} modal>
        <DialogContent
          className={cn('p-0 flex flex-col gap-0 max-h-[90vh] overflow-hidden', maxWidthClasses[maxWidth])}
          onPointerDownOutside={(e) => {
            if (!closeOnOverlayClick) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (disableEscapeKeyDown) e.preventDefault()
          }}
        >
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">{children}</div>
            {!hideDefaultFooter && (
              <DialogFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                {footer ?? (
                  <>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSubmitting}>
                        {cancelText}
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Guardando...' : submitText}
                    </Button>
                  </>
                )}
              </DialogFooter>
            )}
            {hideDefaultFooter && footer}
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>Tienes cambios sin guardar. ¿Deseas descartarlos?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDiscard}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
