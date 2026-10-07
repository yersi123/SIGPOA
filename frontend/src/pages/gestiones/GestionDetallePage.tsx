import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Inbox, Lock, Unlock } from 'lucide-react'

import { EstadoBadge } from '@/components/common/EstadoBadge'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { GestionAbrirDialog } from '@/components/gestiones/GestionAbrirDialog'
import { GestionCerrarDialog } from '@/components/gestiones/GestionCerrarDialog'
import { GestionViewContent } from '@/components/gestiones/GestionViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGestionAbierta } from '@/hooks/useGestionAbierta'
import { useListadoRecurso } from '@/hooks/useListadoRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearMoneda, valorOguion } from '@/lib/formato'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Actividad } from '@/types/actividad'
import type { Gestion } from '@/types/gestion'

/**
 * Detalle de una gestion (tarea 3.1) con acceso directo por URL.
 *
 * El GestionResource solo trae anio, estado y timestamps, asi que el detalle
 * se completa con las actividades de ese anio (GET /actividades?gestion_id=),
 * que es lo que realmente da contexto a la gestion. Los cambios de estado
 * (activar y cerrar) solo los ve el administrador; el boton Activar queda
 * deshabilitado si ya hay otra gestion abierta.
 */
export function GestionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { esAdmin } = usePermisos()

  const gestionId = Number(id)
  const esIdValido = Number.isFinite(gestionId) && gestionId > 0

  const [cerrarOpen, setCerrarOpen] = useState(false)
  const [abrirOpen, setAbrirOpen] = useState(false)

  const consulta = useQuery({
    queryKey: ['gestiones', 'detalle', gestionId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Gestion>>(`/gestiones/${gestionId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const actividades = useListadoRecurso<Actividad>({
    clave: 'actividades',
    ruta: '/actividades',
    filtrosIniciales: { gestion_id: String(gestionId) },
    porPagina: 10,
    habilitado: esIdValido,
  })

  const { gestionAbierta } = useGestionAbierta()

  const gestion = consulta.data ?? null
  const puedeCerrar = esAdmin && gestion !== null && gestion.estado === 'abierta'
  const puedeActivar = esAdmin && gestion !== null && gestion.estado === 'cerrada'

  const columnas: ColumnaResource<Actividad>[] = [
    {
      clave: 'objetivo',
      encabezado: 'Objetivo',
      render: (actividad) => (
        <Link
          to={`/actividades/${actividad.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {actividad.objetivo}
        </Link>
      ),
    },
    {
      clave: 'meta',
      encabezado: 'Meta',
      render: (actividad) => valorOguion(actividad.meta),
      ocultarEnMovil: true,
    },
    {
      clave: 'monto',
      encabezado: 'Monto programado',
      className: 'text-right font-medium text-foreground',
      render: (actividad) => formatearMoneda(actividad.monto_programado),
    },
  ]

  if (!esIdValido) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">El identificador de la gestión no es válido.</p>
        <Button variant="outline" onClick={() => navigate('/gestiones')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Volver al listado de gestiones"
              onClick={() => navigate('/gestiones')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              {gestion ? `Gestión ${gestion.anio}` : 'Detalle de gestión'}
            </h1>
            {gestion && <EstadoBadge estado={gestion.estado} />}
          </div>
          <p className="pl-10 text-sm text-muted-foreground">
            <Link to="/gestiones" className="hover:underline">
              Gestiones
            </Link>{' '}
            / {gestion ? gestion.anio : `#${gestionId}`}
          </p>
        </div>

        {puedeCerrar && (
          <Button onClick={() => setCerrarOpen(true)}>
            <Lock className="mr-2 h-4 w-4" />
            Cerrar gestión
          </Button>
        )}

        {puedeActivar && (
          <Button
            onClick={() => setAbrirOpen(true)}
            disabled={gestionAbierta !== null}
            title={
              gestionAbierta
                ? `Cierra la gestión ${gestionAbierta.anio} antes de activar esta.`
                : undefined
            }
          >
            <Unlock className="mr-2 h-4 w-4" />
            Activar gestión
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la gestión</CardTitle>
        </CardHeader>
        <CardContent>
          {consulta.isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {consulta.isError && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-destructive">
                No se pudo cargar la gestión. Puede que no exista o que no tengas acceso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {gestion && <GestionViewContent gestion={gestion} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Actividades de la gestión{actividades.meta ? ` (${actividades.meta.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResourceTable
            columnas={columnas}
            filas={actividades.datos}
            claveDe={(actividad) => actividad.id}
            cargando={actividades.cargando}
            error={actividades.error}
            alReintentar={actividades.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo="Sin actividades"
            vacioDetalle="Esta gestión todavía no tiene actividades del POA."
          />

          <PaginationBar
            meta={actividades.meta}
            pagina={actividades.pagina}
            alCambiarPagina={actividades.setPagina}
            cargando={actividades.refrescando}
          />
        </CardContent>
      </Card>

      <GestionCerrarDialog
        open={cerrarOpen}
        onOpenChange={setCerrarOpen}
        gestion={gestion}
      />

      <GestionAbrirDialog
        open={abrirOpen}
        onOpenChange={setAbrirOpen}
        gestion={gestion}
      />
    </div>
  )
}