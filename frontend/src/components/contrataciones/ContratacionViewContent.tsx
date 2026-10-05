import { DatoCampo } from '@/components/common/DatoCampo'
import { EstadoBadge } from '@/components/common/EstadoBadge'
import { formatearFecha, formatearMoneda, valorOguion } from '@/lib/formato'
import type { Contratacion } from '@/types/contratacion'

interface ContratacionViewContentProps {
  contratacion: Contratacion
  /** Objetivos cruzados por id: ContratacionResource no trae relaciones anidadas. */
  actividadObjetivo?: string
  proveedorNombre?: string
}

/** Detalle en solo lectura de una contratacion (tarea 11.1). */
export function ContratacionViewContent({
  contratacion,
  actividadObjetivo,
  proveedorNombre,
}: ContratacionViewContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DatoCampo label="Estado" value={<EstadoBadge estado={contratacion.estado} />} />

      <DatoCampo label="Actividad" value={valorOguion(actividadObjetivo)} anchoCompleto />

      <DatoCampo label="Proveedor" value={valorOguion(proveedorNombre)} />

      <DatoCampo label="Monto cotizado" value={formatearMoneda(contratacion.monto_cotizado)} />

      <DatoCampo label="Fecha" value={formatearFecha(contratacion.fecha)} />

      <DatoCampo label="Fecha de cotización" value={formatearFecha(contratacion.fecha_cotizacion)} />

      <DatoCampo
        label="Fecha de adjudicación"
        value={formatearFecha(contratacion.fecha_adjudicacion)}
      />

      <DatoCampo label="Descripción" value={valorOguion(contratacion.descripcion)} anchoCompleto />
    </div>
  )
}