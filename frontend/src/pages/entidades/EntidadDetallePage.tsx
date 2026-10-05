import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { EntidadFormDialog } from '@/components/entidades/EntidadFormDialog'
import { EntidadViewContent } from '@/components/entidades/EntidadViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { EntidadConUnidades } from '@/types/entidad'

/**
 * Tarea 4.4: detalle accesible por URL directa (/entidades/:id).
 *
 * Usa el mismo EntidadViewContent que el ViewDialog del listado, de modo que
 * la informacion es identica por los dos caminos.
 */
export function EntidadDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const rol = useAuthStore((state) => state.user?.rol)

  const puedeEditar = rol === 'administrador'
  const puedeEliminar = rol === 'administrador'

  const [formOpen, setFormOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const entidadId = Number(id)

  const consulta = useQuery({
    queryKey: ['entidades', 'detalle', entidadId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<EntidadConUnidades>>(
        `/entidades/${entidadId}/unidades`,
      )
      return respuesta.data.data
    },
    enabled: Number.isFinite(entidadId),
  })

  const eliminar = useMutation({
    mutationFn: async () => {
      await api.delete(`/entidades/${entidadId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entidades'] })
      toast.success('Entidad eliminada correctamente.')
      navigate('/entidades', { replace: true })
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } }
      }
      toast.error(
        axiosError.response?.data?.message ??
          'No se pudo eliminar la entidad. Puede tener unidades asociadas.',
      )
      setEliminarOpen(false)
    },
  })

  const entidad = consulta.data?.entidad ?? null
  const unidades = consulta.data?.unidades ?? []

  if (!Number.isFinite(entidadId)) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador de la entidad no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/entidades')}>
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
          <Button variant="outline" size="icon" aria-label="Volver al listado" onClick={() => navigate('/entidades')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {entidad?.nombre ?? 'Detalle de entidad'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/entidades" className="hover:underline">
                Entidades
              </Link>
              {' / '}
              {entidad?.nombre ?? `#${entidadId}`}
            </p>
          </div>
        </div>

        {entidad && (
          <div className="flex items-center gap-2">
            {puedeEditar && (
              <Button variant="outline" onClick={() => setFormOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {puedeEliminar && (
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
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {consulta.isError && (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive">
                No se pudo cargar la entidad. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {entidad && (
            <EntidadViewContent
              entidad={entidad}
              unidades={unidades}
              loadingUnidades={consulta.isLoading}
            />
          )}
        </CardContent>
      </Card>

      <EntidadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entidad={entidad}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['entidades'] })
          setFormOpen(false)
          toast.success('Entidad actualizada correctamente.')
        }}
      />

      <DeleteConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        resourceName="entidad"
        resourceLabel="entidad"
        itemName={entidad?.nombre}
        description={
          entidad
            ? `Se eliminará "${entidad.nombre}" de forma permanente. Si tiene unidades asociadas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate()}
      />
    </div>
  )
}