import { useState } from 'react'
import { Inbox, Plus, Trash2 } from 'lucide-react'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { GastoFormDialog } from '@/components/gastos/GastoFormDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { useGastosActividad } from '@/hooks/useGastosActividad'
import { useProveedoresLookup } from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearFecha, formatearMoneda, valorOguion } from '@/lib/formato'
import type { Gasto } from '@/types/gasto'

interface GastosActividadPanelProps {
  actividadId: number
  actividadObjetivo: string
  gestionAnio?: number
  /** Permite anticipar en el formulario el rechazo de R4 por gestion cerrada. */
  gestionCerrada: boolean
}

/**
 * Listado de gastos de una actividad con su alta y su borrado (fase 10).
 *
 * Los gastos no tienen listado global ni detalle por id en el backend, asi que
 * este panel es la unica forma de verlos y se reutiliza tal cual tanto en la
 * pagina de detalle de la actividad como en /gastos.
 */
export function GastosActividadPanel({
  actividadId,
  actividadObjetivo,
  gestionAnio,
  gestionCerrada,
}: GastosActividadPanelProps) {
  const { esAdmin } = usePermisos()

  const [formOpen, setFormOpen] = useState(false)
  const [aEliminar, setAEliminar] = useState<Gasto | null>(null)

  const listado = useGastosActividad(actividadId)
  const proveedores = useProveedoresLookup()

  const eliminar = useEliminarRecurso({
    clave: 'gastos',
    ruta: '/gastos',
    exito: 'Gasto eliminado correctamente.',
    generico: 'No se pudo eliminar el gasto.',
    conflicto: 'No se pudo eliminar el gasto porque sigue asociado a la actividad.',
    alTerminar: () => setAEliminar(null),
  })

  const columnas: ColumnaResource<Gasto>[] = [
    {
      clave: 'fecha',
      encabezado: 'Fecha',
      render: (gasto) => formatearFecha(gasto.fecha),
    },
    {
      clave: 'proveedor',
      encabezado: 'Proveedor',
      render: (gasto) =>
        valorOguion(proveedores.data?.find((p) => p.id === gasto.proveedor_id)?.nombre),
      ocultarEnMovil: true,
    },
    {
      clave: 'detalle',
      encabezado: 'Detalle',
      render: (gasto) => valorOguion(gasto.detalle),
    },
    {
      clave: 'monto',
      encabezado: 'Monto',
      className: 'text-right font-medium text-foreground',
      render: (gasto) => formatearMoneda(gasto.monto),
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">Gastos de la actividad</CardTitle>
          <p className="text-sm text-muted-foreground">
            {listado.total} {listado.total === 1 ? 'gasto registrado' : 'gastos registrados'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar gasto
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ResourceTable
          columnas={columnas}
          filas={listado.gastos}
          claveDe={(gasto) => gasto.id}
          cargando={listado.cargando}
          error={listado.error}
          alReintentar={listado.recargar}
          iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
          vacioTitulo="Aún no hay gastos"
          vacioDetalle="Registra el primer gasto de esta actividad."
          // Sin columna de edicion a proposito: el backend no expone PUT para
          // gastos (tarea 10.1).
          renderAcciones={
            esAdmin
              ? (gasto) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar el gasto del ${formatearFecha(gasto.fecha)}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setAEliminar(gasto)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )
              : undefined
          }
        />

        {listado.total > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total gastado en la actividad</span>
            <span className="font-semibold">{formatearMoneda(listado.totalMonto)}</span>
          </div>
        )}
      </CardContent>

      <GastoFormDialog
        // La key incluye `formOpen` para que cada apertura arranque con el
        // formulario limpio.
        key={`${actividadId}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        actividadId={actividadId}
        actividadObjetivo={actividadObjetivo}
        gestionAnio={gestionAnio}
        gestionCerrada={gestionCerrada}
        onSaved={() => setFormOpen(false)}
      />

      <DeleteConfirmDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAEliminar(null)
        }}
        resourceName="gasto"
        resourceLabel="el gasto"
        itemName={aEliminar ? `${formatearMoneda(aEliminar.monto)} del ${formatearFecha(aEliminar.fecha)}` : undefined}
        description={
          aEliminar
            ? `Se eliminará de forma permanente el gasto de ${formatearMoneda(aEliminar.monto)} registrado el ${formatearFecha(aEliminar.fecha)}. Ten en cuenta que los gastos no se pueden editar: si el importe o la fecha están mal, la única forma de corregirlo es eliminarlo y registrarlo de nuevo.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => {
          if (aEliminar) eliminar.mutate(aEliminar.id)
        }}
      />
    </Card>
  )
}