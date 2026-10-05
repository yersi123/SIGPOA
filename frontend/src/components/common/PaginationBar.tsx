import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { PaginationMeta } from '@/types/common'

interface PaginationBarProps {
  meta: PaginationMeta | undefined
  pagina: number
  alCambiarPagina: (pagina: number) => void
  cargando?: boolean
  /** Sustituye al texto "Mostrando X-Y de Z". */
  resumen?: string
}

/**
 * Paginador que consume la `meta` que devuelve la API, no un total contado en
 * el cliente. Cuando hay una sola pagina no se dibuja nada.
 */
export function PaginationBar({
  meta,
  pagina,
  alCambiarPagina,
  cargando = false,
  resumen,
}: PaginationBarProps) {
  const totalPaginas = meta?.last_page ?? 1

  if (totalPaginas <= 1) return null

  const desde = meta?.from ?? 0
  const hasta = meta?.to ?? 0
  const total = meta?.total ?? 0

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {resumen ?? `Mostrando ${desde}-${hasta} de ${total}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagina <= 1 || cargando}
          onClick={() => alCambiarPagina(Math.max(1, pagina - 1))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          {pagina} / {totalPaginas}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas || cargando}
          onClick={() => alCambiarPagina(Math.min(totalPaginas, pagina + 1))}
        >
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}