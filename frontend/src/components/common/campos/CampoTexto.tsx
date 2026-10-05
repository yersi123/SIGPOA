import type * as React from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CampoTextoProps extends Omit<React.ComponentProps<'input'>, 'id'> {
  id: string
  label: string
  error?: string
  descripcion?: string
  obligatorio?: boolean
  containerClassName?: string
}

/**
 * Campo de texto con etiqueta y mensaje de error.
 *
 * Acepta las props de un input nativo, asi que se puede usar directamente con
 * el `register` de react-hook-form: `{...register('nombre')}`.
 */
export function CampoTexto({
  id,
  label,
  error,
  descripcion,
  obligatorio = false,
  containerClassName,
  ...props
}: CampoTextoProps) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <Label htmlFor={id}>
        {label}
        {obligatorio && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={id} aria-invalid={!!error} {...props} />
      {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}