import { DatoCampo } from '@/components/common/DatoCampo'
import { EstadoBadge } from '@/components/common/EstadoBadge'
import { formatearMoneda, valorOguion } from '@/lib/formato'
import type { Propuesta } from '@/types/propuesta'

interface PropuestaViewContentProps {
  propuesta: Propuesta
  /** Nombres cruzados por id: PropuestaResource no trae relaciones anidadas. */
  organizacionNombre?: string
  organizacionTipo?: string
  gestionAnio?: number
  gestionEstado?: string
  actividadObjetivo?: string
}

/** Detalle en solo lectura de una propuesta participativa (tarea 12.1). */
export function PropuestaViewContent({
  propuesta,
  organizacionNombre,
  organizacionTipo,
  gestionAnio,
  gestionEstado,
  actividadObjetivo,
}: PropuestaViewContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DatoCampo label="Estado" value={<EstadoBadge estado={propuesta.estado} />} />

      <DatoCampo
        label="Gestión"
        value={gestionAnio ? `${gestionAnio}${gestionEstado ? ` (${gestionEstado})` : ''}` : undefined}
      />

      <DatoCampo
        label="Organización"
        value={
          organizacionNombre
            ? `${organizacionNombre}${organizacionTipo ? ` (${organizacionTipo})` : ''}`
            : undefined
        }
      />

      <DatoCampo label="Actividad del POA" value={valorOguion(actividadObjetivo)} />

      <DatoCampo label="Monto asignado" value={formatearMoneda(propuesta.monto_asignado)} />

      <DatoCampo label="Título" value={valorOguion(propuesta.titulo)} />

      <DatoCampo label="Descripción" value={valorOguion(propuesta.descripcion)} anchoCompleto />
    </div>
  )
}