import { User } from 'lucide-react'

import { DatoCampo } from '@/components/common/DatoCampo'
import { formatearFecha, valorOguion } from '@/lib/formato'

interface UnidadViewContentProps {
  unidad: {
    id: number
    entidad_id: number
    nombre: string
    responsable?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  /** Nombre de la entidad, resuelto con una consulta a /entidades. */
  entidadNombre?: string
  mostrarFechas?: boolean
}

/**
 * Cuerpo de solo lectura de una unidad.
 *
 * Se reutiliza en el ViewDialog del listado y en la pagina de detalle para que
 * ambos caminos muestren exactamente los mismos datos.
 */
export function UnidadViewContent({
  unidad,
  entidadNombre,
  mostrarFechas = true,
}: UnidadViewContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{unidad.nombre}</p>
          <p className="text-sm text-muted-foreground">
            {valorOguion(entidadNombre)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DatoCampo label="Entidad" value={valorOguion(entidadNombre)} />
        <DatoCampo label="Responsable" value={valorOguion(unidad.responsable)} />
      </div>

      {mostrarFechas && (
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <DatoCampo label="Creada" value={formatearFecha(unidad.created_at)} />
          <DatoCampo label="Actualizada" value={formatearFecha(unidad.updated_at)} />
        </div>
      )}
    </div>
  )
}