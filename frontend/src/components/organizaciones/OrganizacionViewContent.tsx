import { Users } from 'lucide-react'

import { DatoCampo } from '@/components/common/DatoCampo'
import { Badge } from '@/components/ui/badge'
import { formatearFecha, valorOguion } from '@/lib/formato'
import { ORGANIZACION_TIPO_LABELS, type Organizacion } from '@/types/organizacion'

interface OrganizacionViewContentProps {
  organizacion: Organizacion
  mostrarFechas?: boolean
}

/** Cuerpo de solo lectura de una organización, compartido por modal y detalle. */
export function OrganizacionViewContent({
  organizacion,
  mostrarFechas = true,
}: OrganizacionViewContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{organizacion.nombre}</p>
          <Badge variant="secondary">{ORGANIZACION_TIPO_LABELS[organizacion.tipo]}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DatoCampo label="Tipo" value={ORGANIZACION_TIPO_LABELS[organizacion.tipo]} />
        <DatoCampo
          label="Personería jurídica"
          value={valorOguion(organizacion.personeria_juridica)}
        />
        <DatoCampo label="Representante" value={valorOguion(organizacion.representante)} />
        <DatoCampo label="Teléfono" value={valorOguion(organizacion.telefono)} />
        <DatoCampo label="Dirección" value={valorOguion(organizacion.direccion)} anchoCompleto />
      </div>

      {mostrarFechas && (
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <DatoCampo label="Creada" value={formatearFecha(organizacion.created_at)} />
          <DatoCampo label="Actualizada" value={formatearFecha(organizacion.updated_at)} />
        </div>
      )}
    </div>
  )
}