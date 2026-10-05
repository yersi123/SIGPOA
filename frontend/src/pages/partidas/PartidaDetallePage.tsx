import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { PartidaFormDialog } from '@/components/partidas/PartidaFormDialog'
import { PartidaViewContent } from '@/components/partidas/PartidaViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Partida } from '@/types/partida'

/** Tarea 6.1: detalle de una partida por URL directa (/partidas/:id). */
export function PartidaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { esAdmin } = usePermisos()

  const [formOpen, setFormOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const partidaId = Number(id)
  const esIdValido = Number.isFinite(partidaId) && partidaId > 0

  const consulta = useQuery({
    queryKey: ['partidas', 'detalle', partidaId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Partida>>(`/partidas/${partidaId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const eliminar = useEliminarRecurso({
    clave: 'partidas',
    ruta: '/partidas',
    exito: 'Partida eliminada correctamente.',
    generico: 'No se pudo eliminar la partida.',
    conflicto: 'No se puede eliminar: la partida tiene actividades asociadas.',
    alTerminar: () => navigate('/partidas', { replace: true }),
  })

  const partida = consulta.data ?? null

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador de la partida no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/partidas')}>
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
            onClick={() => navigate('/partidas')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {partida?.nombre ?? 'Detalle de partida'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/partidas" className="hover:underline">
                Partidas
              </Link>
              {' / '}
              {partida?.nombre ?? `#${partidaId}`}
            </p>
          </div>
        </div>

        {partida && esAdmin && (
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
                No se pudo cargar la partida. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {partida && <PartidaViewContent partida={partida} />}
        </CardContent>
      </Card>

      {partida && (
        <PartidaFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          key={partida.id}
          partida={partida}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['partidas'] })
            setFormOpen(false)
            toast.success('Partida actualizada correctamente.')
          }}
        />
      )}

      <DeleteConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        resourceName="partida"
        resourceLabel="partida presupuestaria"
        itemName={partida?.nombre}
        description={
          partida
            ? `Se eliminará "${partida.nombre}" de forma permanente. Si tiene actividades registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(partidaId)}
      />
    </div>
  )
}