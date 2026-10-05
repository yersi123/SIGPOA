import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { OrganizacionFormDialog } from '@/components/organizaciones/OrganizacionFormDialog'
import { OrganizacionViewContent } from '@/components/organizaciones/OrganizacionViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Organizacion } from '@/types/organizacion'

/** Tarea 8.1: detalle de una organización por URL directa (/organizaciones/:id). */
export function OrganizacionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { esAdmin } = usePermisos()

  const [formOpen, setFormOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const organizacionId = Number(id)
  const esIdValido = Number.isFinite(organizacionId) && organizacionId > 0

  const consulta = useQuery({
    queryKey: ['organizaciones', 'detalle', organizacionId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Organizacion>>(`/organizaciones/${organizacionId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const eliminar = useEliminarRecurso({
    clave: 'organizaciones',
    ruta: '/organizaciones',
    exito: 'Organización eliminada correctamente.',
    generico: 'No se pudo eliminar la organización.',
    conflicto: 'No se puede eliminar: la organización tiene propuestas participativas asociadas.',
    alTerminar: () => navigate('/organizaciones', { replace: true }),
  })

  const organizacion = consulta.data ?? null

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          El identificador de la organización no es válido.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/organizaciones')}>
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
            onClick={() => navigate('/organizaciones')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {organizacion?.nombre ?? 'Detalle de organización'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/organizaciones" className="hover:underline">
                Organizaciones
              </Link>
              {' / '}
              {organizacion?.nombre ?? `#${organizacionId}`}
            </p>
          </div>
        </div>

        {organizacion && esAdmin && (
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
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {consulta.isError && (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive">
                No se pudo cargar la organización. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {organizacion && <OrganizacionViewContent organizacion={organizacion} />}
        </CardContent>
      </Card>

      {organizacion && (
        <OrganizacionFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          key={organizacion.id}
          organizacion={organizacion}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
            setFormOpen(false)
            toast.success('Organización actualizada correctamente.')
          }}
        />
      )}

      <DeleteConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        resourceName="organización"
        resourceLabel="organización"
        itemName={organizacion?.nombre}
        description={
          organizacion
            ? `Se eliminará "${organizacion.nombre}" de forma permanente. Si tiene propuestas participativas registradas, la base de datos rechazará la operación con un 409 y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(organizacionId)}
      />
    </div>
  )
}