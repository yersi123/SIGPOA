import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { ProveedorFormDialog } from '@/components/proveedores/ProveedorFormDialog'
import { ProveedorViewContent } from '@/components/proveedores/ProveedorViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type { Proveedor } from '@/types/proveedor'

/** Tarea 7.1: detalle de un proveedor por URL directa (/proveedores/:id). */
export function ProveedorDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { esAdmin } = usePermisos()

  const [formOpen, setFormOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const proveedorId = Number(id)
  const esIdValido = Number.isFinite(proveedorId) && proveedorId > 0

  const consulta = useQuery({
    queryKey: ['proveedores', 'detalle', proveedorId],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<Proveedor>>(`/proveedores/${proveedorId}`)
      return respuesta.data.data
    },
    enabled: esIdValido,
  })

  const eliminar = useEliminarRecurso({
    clave: 'proveedores',
    ruta: '/proveedores',
    exito: 'Proveedor eliminado correctamente.',
    generico: 'No se pudo eliminar el proveedor.',
    conflicto: 'No se puede eliminar: el proveedor tiene gastos o contrataciones asociadas.',
    alTerminar: () => navigate('/proveedores', { replace: true }),
  })

  const proveedor = consulta.data ?? null

  if (!esIdValido) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">El identificador del proveedor no es válido.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/proveedores')}>
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
            onClick={() => navigate('/proveedores')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {proveedor?.nombre ?? 'Detalle de proveedor'}
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link to="/proveedores" className="hover:underline">
                Proveedores
              </Link>
              {' / '}
              {proveedor?.nombre ?? `#${proveedorId}`}
            </p>
          </div>
        </div>

        {proveedor && esAdmin && (
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
                No se pudo cargar el proveedor. Puede que no exista o que no tengas permiso.
              </p>
              <Button variant="outline" onClick={() => consulta.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {proveedor && <ProveedorViewContent proveedor={proveedor} />}
        </CardContent>
      </Card>

      {proveedor && (
        <ProveedorFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          key={proveedor.id}
          proveedor={proveedor}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] })
            setFormOpen(false)
            toast.success('Proveedor actualizado correctamente.')
          }}
        />
      )}

      <DeleteConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        resourceName="proveedor"
        resourceLabel="proveedor"
        itemName={proveedor?.nombre}
        description={
          proveedor
            ? `Se eliminará "${proveedor.nombre}" de forma permanente. Si tiene gastos o contrataciones registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(proveedorId)}
      />
    </div>
  )
}