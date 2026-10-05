import { Badge } from '@/components/ui/badge'
import { ESTADOS_GESTIONABLES, type EstadoGestionable } from '@/lib/estados'
import { cn } from '@/lib/utils'

/**
 * Distintivo de color para un estado de contratacion o propuesta.
 *
 * El color recorre el ciclo real: gris al abrir, azul en tramite, verde al
 * cerrarse.
 */
export function EstadoBadge({
  estado,
  className,
}: {
  estado: EstadoGestionable
  className?: string
}) {
  const definicion = ESTADOS_GESTIONABLES[estado]

  // Un estado desconocido no deberia romper la fila: se muestra el texto tal cual.
  if (!definicion) return <Badge variant="outline">{estado}</Badge>

  return (
    <Badge variant="outline" className={cn(definicion.clase, className)}>
      {definicion.etiqueta}
    </Badge>
  )
}
