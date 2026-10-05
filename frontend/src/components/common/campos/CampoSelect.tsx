import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface OpcionCampoSelect {
  valor: string
  etiqueta: string
  /** Texto adicional de la opcion, util para mostrar el codigo junto al nombre. */
  secundario?: string
  disabled?: boolean
}

interface CampoSelectProps {
  id: string
  label: string
  error?: string
  descripcion?: string
  obligatorio?: boolean
  placeholder?: string
  valor: string
  onValorChange: (valor: string) => void
  opciones: OpcionCampoSelect[]
  disabled?: boolean
  containerClassName?: string
  className?: string
}

/**
 * Desplegable con etiqueta y mensaje de error.
 *
 * `valor` vacio significa "sin seleccionar": el placeholder se muestra y el
 * `<SelectValue>` no intenta buscar una opcion que no existe.
 */
export function CampoSelect({
  id,
  label,
  error,
  descripcion,
  obligatorio = false,
  placeholder = 'Selecciona una opción',
  valor,
  onValorChange,
  opciones,
  disabled = false,
  containerClassName,
  className,
}: CampoSelectProps) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <Label htmlFor={id}>
        {label}
        {obligatorio && <span className="text-destructive"> *</span>}
      </Label>
      <Select
        value={valor}
        onValueChange={onValorChange}
        disabled={disabled || opciones.length === 0}
      >
        <SelectTrigger id={id} className={className} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opciones.map((opcion) => (
            <SelectItem key={opcion.valor} value={opcion.valor} disabled={opcion.disabled}>
              {opcion.secundario ? `${opcion.secundario} — ${opcion.etiqueta}` : opcion.etiqueta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}