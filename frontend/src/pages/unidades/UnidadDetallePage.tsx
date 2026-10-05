import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { UnidadFormDialog } from '@/components/unidades/UnidadFormDialog'
import { UnidadViewContent } from '@/components/unidades/UnidadViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { useEntidadesLookup } from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Unidad } from '@/types/unidad'

/**
 * Tarea 5.1: detalle de una unidad accesible por URL directa
 * (/unidades/:id). Reutiliza el mismo UnidadViewContent que el ViewDialog.
 */
export function UnidadDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { esAdmin } = usePermisos()
  const entidades = useEntidadesLookup()

  const [formOpen, setFormOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const unidadId = Number(id)
  const esIdValido = Number.isFinite(unidadId) && unidadId > 0

  const consulta = useQuery({
    queryKey: ['unidades', 'detalle', unidadId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Unidad>>(`/unidades/${unidadId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const eliminar = useEliminarRecurso({
    clave: 'unidades',
    ruta: '/unidades',
    exito: 'Unidad eliminada correctamente.',
    generico: 'No se pudo eliminar la unidad.',
    conflicto: 'No se puede eliminar: la unidad tiene actividades asociadas.',
    alTerminar: () => navigate('/unidades', { replace: true }),
  })

  const unidad = consulta.data ?? null
  const nombreEntidad = (entidades.data ?? []).find((entidad) => entidad.id === unidad?.entidad_id)
    ?.nombre

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador de la unidad no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/unidades')}>
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
            onClick={() => navigate('/unidades')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {unidad?.nombre ?? 'Detalle de unidad'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/unidades" className="hover:underline">
                Unidades
              </Link>
              {' / '}
              {unidad?.nombre ?? `#${unidadId}`}
            </p>
          </div>
        </div>

        {unidad && esAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setEliminarOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {consulta.isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {consulta.isError && (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive">
                No se pudo cargar la unidad. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {unidad && (
            <UnidadViewContent unidad={unidad} entidadNombre={nombreEntidad} />
          )}
        </CardContent>
      </Card>

      {unidad && (
        <UnidadFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          key={unidad.id}
          unidad={unidad}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['unidades'] })
            setFormOpen(false)
            toast.success('Unidad actualizada correctamente.')
          }}
        />
      )}

      <DeleteConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        resourceName="unidad"
        resourceLabel="unidad"
        itemName={unidad?.nombre}
        description={
          unidad
            ? `Se eliminará "${unidad.nombre}" de forma permanente. Si tiene actividades registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(unidadId)}
      />
    </div>
  )
}