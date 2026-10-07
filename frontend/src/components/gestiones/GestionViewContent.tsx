import { DatoCampo } from '@/components/common/DatoCampo'
import { EstadoBadge } from '@/components/common/EstadoBadge'
import { formatearFecha } from '@/lib/formato'
import type { Gestion } from '@/types/gestion'

interface GestionViewContentProps {
  gestion: Gestion
}

/** Detalle en solo lectura de una gestion (tarea 3.1). */
export function GestionViewContent({ gestion }: GestionViewContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DatoCampo label="Año" value={gestion.anio} />

      <DatoCampo label="Estado" value={<EstadoBadge estado={gestion.estado} />} />

      <DatoCampo label="Creada" value={formatearFecha(gestion.created_at)} />

      <DatoCampo label="Última actualización" value={formatearFecha(gestion.updated_at)} />
    </div>
  )
}
