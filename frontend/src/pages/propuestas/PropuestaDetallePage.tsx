import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { PropuestaEstadoDialog } from '@/components/propuestas/PropuestaEstadoDialog'
import { PropuestaViewContent } from '@/components/propuestas/PropuestaViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { siguienteEstadoPropuesta } from '@/hooks/useAccionesPropuesta'
import {
  useActividadesLookup,
  useGestionesLookup,
  useOrganizacionesLookup,
} from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Propuesta } from '@/types/propuesta'

/**
 * Detalle de una propuesta participativa por URL directa (/propuestas/:id).
 *
 * Permite compartir el enlace a un expediente y es donde se ve el estado y la
 * imputacion al POA.
 */
export function PropuestaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { puedeEditar } = usePermisos()

  const [estadoOpen, setEstadoOpen] = useState(false)

  const propuestaId = Number(id)
  const esIdValido = Number.isFinite(propuestaId) && propuestaId > 0

  const consulta = useQuery({
    queryKey: ['propuestas', 'detalle', propuestaId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Propuesta>>(`/propuestas/${propuestaId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const organizaciones = useOrganizacionesLookup()
  const gestiones = useGestionesLookup()
  const actividades = useActividadesLookup()

  const propuesta = consulta.data ?? null
  const organizacion = organizaciones.data?.find((o) => o.id === propuesta?.organizacion_id)
  const gestion = gestiones.data?.find((g) => g.id === propuesta?.gestion_id)

  const puedeAvanzar =
    puedeEditar && propuesta !== null && siguienteEstadoPropuesta(propuesta.estado) !== null

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador de la propuesta no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/propuestas')}>
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
            onClick={() => navigate('/propuestas')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {propuesta?.titulo ?? 'Detalle de propuesta'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/propuestas" className="hover:underline">
                Propuestas participativas
              </Link>
              {' / '}
              {propuesta?.titulo ?? `#${propuestaId}`}
            </p>
          </div>
        </div>

        {puedeAvanzar && (
          <Button onClick={() => setEstadoOpen(true)}>
            <ArrowRight className="mr-2 h-4 w-4" />
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
                No se pudo cargar la propuesta. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {propuesta && (
            <PropuestaViewContent
              propuesta={propuesta}
              organizacionNombre={organizacion?.nombre}
              organizacionTipo={organizacion?.tipo}
              gestionAnio={gestion?.anio}
              gestionEstado={gestion?.estado}
              actividadObjetivo={
                actividades.data?.find((a) => a.id === propuesta.actividad_id)?.objetivo
              }
            />
          )}
        </CardContent>
      </Card>

      {propuesta && (
        <PropuestaEstadoDialog
          key={`detalle-${estadoOpen ? 'abierta' : 'cerrada'}`}
          open={estadoOpen}
          onOpenChange={setEstadoOpen}
          propuesta={propuesta}
        />
      )}
    </div>
  )
}