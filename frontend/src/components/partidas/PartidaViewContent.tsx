import { Hash } from 'lucide-react'

import { DatoCampo } from '@/components/common/DatoCampo'
import { Badge } from '@/components/ui/badge'
import { formatearFecha } from '@/lib/formato'
import type { Partida } from '@/types/partida'

interface PartidaViewContentProps {
  partida: Partida
  mostrarFechas?: boolean
}

/** Cuerpo de solo lectura de una partida, compartido por el modal y el detalle. */
export function PartidaViewContent({ partida, mostrarFechas = true }: PartidaViewContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Hash className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{partida.nombre}</p>
          <Badge variant="secondary">{partida.codigo}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DatoCampo label="Código" value={partida.codigo} />
        <DatoCampo label="Nombre" value={partida.nombre} />
      </div>

      {mostrarFechas && (
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <DatoCampo label="Creada" value={formatearFecha(partida.created_at)} />
          <DatoCampo label="Actualizada" value={formatearFecha(partida.updated_at)} />
        </div>
      )}
    </div>
  )
}