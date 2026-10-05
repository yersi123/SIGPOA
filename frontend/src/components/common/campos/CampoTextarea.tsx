import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CampoTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'id'> {
  id: string
  label: string
  error?: string
  descripcion?: string
  obligatorio?: boolean
  containerClassName?: string
}

/** Campo de texto multilinea con etiqueta y mensaje de error. */
export function CampoTextarea({
  id,
  label,
  error,
  descripcion,
  obligatorio = false,
  containerClassName,
  ...props
}: CampoTextareaProps) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <Label htmlFor={id}>
        {label}
        {obligatorio && <span className="text-destructive"> *</span>}
      </Label>
      <Textarea id={id} aria-invalid={!!error} {...props} />
      {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}