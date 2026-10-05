import { Building2, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ENTIDAD_TIPO_LABELS,
  type Entidad,
  type EntidadUnidad,
} from '@/types/entidad'

interface EntidadViewContentProps {
  entidad: Entidad
  unidades?: EntidadUnidad[]
  /** Muestra el bloque de unidades anidadas. */
  showUnidades?: boolean
  loadingUnidades?: boolean
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

/**
 * Cuerpo de solo lectura de una entidad.
 *
 * Se usa tal cual dentro del ViewDialog del listado y dentro de la pagina de
 * detalle, para que ambos showed exactly the same datos.
 */
export function EntidadViewContent({
  entidad,
  unidades = [],
  showUnidades = true,
  loadingUnidades = false,
}: EntidadViewContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{entidad.nombre}</p>
          <Badge variant="secondary">{ENTIDAD_TIPO_LABELS[entidad.tipo]}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Dato label="Departamento" value={entidad.departamento} />
        <Dato label="Municipio" value={entidad.municipio?.trim() ? entidad.municipio : '—'} />
      </div>

      {showUnidades && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Unidades ({unidades.length})
            </p>
          </div>

          {loadingUnidades ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : unidades.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
              Esta entidad no tiene unidades registradas.
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {unidades.map((unidad) => (
                <li key={unidad.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-sm">{unidad.nombre}</span>
                  {unidad.responsable && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {unidad.responsable}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
