import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { ActividadFormDialog } from '@/components/actividades/ActividadFormDialog'
import { ActividadViewContent } from '@/components/actividades/ActividadViewContent'
import { GastosActividadPanel } from '@/components/gastos/GastosActividadPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import {
  useGestionesLookup,
  useOrganizacionesLookup,
  usePartidasLookup,
  useUnidadesLookup,
} from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Actividad, ActividadEjecucion } from '@/types/actividad'

/**
 * Tarea 9.1: detalle de una actividad por URL directa (/actividades/:id),
 * con los datos de ejecucion que devuelve v_ejecucion_actividad.
 */
export function ActividadDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { esAdmin, puedeEditar } = usePermisos()

  const [formOpen, setFormOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const actividadId = Number(id)
  const esIdValido = Number.isFinite(actividadId) && actividadId > 0

  const consulta = useQuery({
    queryKey: ['actividades', 'detalle', actividadId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Actividad>>(`/actividades/${actividadId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const consultaEjecucion = useQuery({
    queryKey: ['actividades', 'ejecucion', actividadId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<ActividadEjecucion>>(
        `/actividades/${actividadId}/ejecucion`,
      )
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const unidades = useUnidadesLookup()
  const partidas = usePartidasLookup()
  const organizaciones = useOrganizacionesLookup()
  const gestiones = useGestionesLookup()

  const eliminar = useEliminarRecurso({
    clave: 'actividades',
    ruta: '/actividades',
    exito: 'Actividad eliminada correctamente.',
    generico: 'No se pudo eliminar la actividad.',
    conflicto: 'No se puede eliminar: la actividad tiene gastos o contrataciones asociadas.',
    alTerminar: () => navigate('/actividades', { replace: true }),
  })

  const actividad = consulta.data ?? null
  const unidadNombre = unidades.data?.find((u) => u.id === actividad?.unidad_id)?.nombre
  const partida = partidas.data?.find((p) => p.id === actividad?.partida_id)
  const organizacion =
    organizaciones.data?.find((o) => o.id === actividad?.organizacion_id) ?? null
  const gestion = gestiones.data?.find((g) => g.id === actividad?.gestion_id)

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador de la actividad no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/actividades')}>
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
            onClick={() => navigate('/actividades')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {actividad?.objetivo ?? 'Detalle de actividad'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/actividades" className="hover:underline">
                Actividades
              </Link>
              {' / '}
              {actividad?.objetivo ?? `#${actividadId}`}
            </p>
          </div>
        </div>

        {actividad && (
          <div className="flex items-center gap-2">
            {puedeEditar && (
              <Button variant="outline" onClick={() => setFormOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {esAdmin && (
              <Button variant="destructive" onClick={() => setEliminarOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>
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
                No se pudo cargar la actividad. Puede que no exista, que no tengas permiso o que
                no pertenezca a tu unidad.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {actividad && (
            <ActividadViewContent
              actividad={actividad}
              unidadNombre={unidadNombre}
              partidaCodigo={partida?.codigo}
              partidaNombre={partida?.nombre}
              organizacion={organizacion}
              gestionAnio={gestion?.anio}
              ejecucion={consultaEjecucion.data}
              cargandoEjecucion={consultaEjecucion.isPending}
            />
          )}
        </CardContent>
      </Card>

      {actividad && (
        <GastosActividadPanel
          actividadId={actividad.id}
          actividadObjetivo={actividad.objetivo}
          gestionAnio={gestion?.anio}
          gestionCerrada={gestion?.estado === 'cerrada'}
        />
      )}

      {actividad && (
        <ActividadFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          key={actividad.id}
          actividad={actividad}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['actividades'] })
            setFormOpen(false)
            toast.success('Actividad actualizada correctamente.')
          }}
        />
      )}

      <DeleteConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        resourceName="actividad"
        resourceLabel="actividad"
        itemName={actividad?.objetivo}
        description={
          actividad
            ? `Se eliminará "${actividad.objetivo}" de forma permanente. Si tiene gastos o contrataciones registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(actividadId)}
      />
    </div>
  )
}