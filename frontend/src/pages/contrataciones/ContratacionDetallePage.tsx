import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Gavel } from 'lucide-react'

import { ContratacionEstadoDialog } from '@/components/contrataciones/ContratacionEstadoDialog'
import { ContratacionViewContent } from '@/components/contrataciones/ContratacionViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { siguienteEstadoContratacion } from '@/hooks/useAccionesContratacion'
import { useActividadesLookup, useProveedoresLookup } from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Contratacion } from '@/types/contratacion'

/**
 * Detalle de una contratacion por URL directa (/contrataciones/:id).
 *
 * Sirve para poder compartir el enlace a un registro concreto, ya que la
 * contratacion no tiene pagina propia de edicion.
 */
export function ContratacionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { puedeEditar } = usePermisos()

  const [estadoOpen, setEstadoOpen] = useState(false)

  const contratacionId = Number(id)
  const esIdValido = Number.isFinite(contratacionId) && contratacionId > 0

  const consulta = useQuery({
    queryKey: ['contrataciones', 'detalle', contratacionId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Contratacion>>(
        `/contrataciones/${contratacionId}`,
      )
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const actividades = useActividadesLookup()
  const proveedores = useProveedoresLookup()

  const contratacion = consulta.data ?? null
  const puedeAvanzar =
    puedeEditar && contratacion !== null && siguienteEstadoContratacion(contratacion.estado) !== null

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador de la contratación no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/contrataciones')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Volver al listado"
            onClick={() => navigate('/contrataciones')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {contratacion?.descripcion ?? 'Detalle de contratación'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/contrataciones" className="hover:underline">
                Contrataciones
              </Link>
              {' / '}
              {contratacion?.descripcion ?? `#${contratacionId}`}
            </p>
          </div>
        </div>

        {puedeAvanzar && (
          <Button onClick={() => setEstadoOpen(true)}>
            <Gavel className="mr-2 h-4 w-4" />
            Avanzar estado
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {consulta.isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {consulta.isError && (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive">
                No se pudo cargar la contratación. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {contratacion && (
            <ContratacionViewContent
              contratacion={contratacion}
              actividadObjetivo={
                actividades.data?.find((a) => a.id === contratacion.actividad_id)?.objetivo
              }
              proveedorNombre={proveedores.data?.find((p) => p.id === contratacion.proveedor_id)
                ?.nombre}
            />
          )}
        </CardContent>
      </Card>

      <ContratacionEstadoDialog
        open={estadoOpen}
        onOpenChange={setEstadoOpen}
        contratacion={contratacion}
      />
    </div>
  )
}