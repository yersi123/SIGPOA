import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Hash, Inbox, Pencil, Plus, Trash2 } from 'lucide-react'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { PartidaFormDialog } from '@/components/partidas/PartidaFormDialog'
import { PartidaViewContent } from '@/components/partidas/PartidaViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { useListadoRecurso } from '@/hooks/useListadoRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearFecha } from '@/lib/formato'
import type { Partida } from '@/types/partida'

/**
 * Tarea 6.1: listado de partidas presupuestarias.
 *
 * La API ofrece dos filtros: q busca en nombre y codigo, y prefijo acota el
 * inicio del codigo. Se exponen los dos porque el listado ordenado por codigo
 * se recorre mucho por prefijo.
 */
export function PartidasPage() {
  const { esAdmin } = usePermisos()

  const listado = useListadoRecurso<Partida>({
    clave: 'partidas',
    ruta: '/partidas',
    filtrosIniciales: { q: '', prefijo: '' },
    porPagina: 10,
  })

  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Partida | null>(null)
  const [enVista, setEnVista] = useState<Partida | null>(null)
  const [aEliminar, setAEliminar] = useState<Partida | null>(null)

  const eliminar = useEliminarRecurso({
    clave: 'partidas',
    ruta: '/partidas',
    exito: 'Partida eliminada correctamente.',
    generico: 'No se pudo eliminar la partida.',
    conflicto: 'No se puede eliminar: la partida tiene actividades asociadas.',
    alTerminar: () => setAEliminar(null),
  })

  const columnas: ColumnaResource<Partida>[] = [
    {
      clave: 'codigo',
      encabezado: 'Código',
      render: (partida) => (
        <span className="font-mono text-xs text-foreground">{partida.codigo}</span>
      ),
    },
    {
      clave: 'nombre',
      encabezado: 'Nombre',
      render: (partida) => (
        <Link to={`/partidas/${partida.id}`} className="font-medium text-foreground hover:underline">
          {partida.nombre}
        </Link>
      ),
    },
    {
      clave: 'actualizada',
      encabezado: 'Actualizada',
      render: (partida) => formatearFecha(partida.updated_at),
      ocultarEnMovil: true,
    },
  ]

  const abrirCrear = () => {
    setEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (partida: Partida) => {
    setEnEdicion(partida)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partidas presupuestarias</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1 ? 'partida registrada' : 'partidas registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva partida
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <form
            className="min-w-[240px] flex-1 space-y-1.5"
            onSubmit={(evento) => {
              evento.preventDefault()
              listado.setFiltro('q', q)
            }}
          >
            <Label htmlFor="filtro-q">Buscar</Label>
            <Input
              id="filtro-q"
              value={q}
              onChange={(evento) => setQ(evento.target.value)}
              placeholder="Nombre o código. Pulsa Enter"
            />
          </form>

          <div className="min-w-[160px] space-y-1.5">
            <Label htmlFor="filtro-prefijo">Prefijo de código</Label>
            <Input
              id="filtro-prefijo"
              value={listado.filtros.prefijo}
              onChange={(evento) => listado.setFiltro('prefijo', evento.target.value)}
              placeholder="Ej. 2"
            />
          </div>

          {listado.hayFiltros && (
            <Button
              variant="outline"
              onClick={() => {
                setQ('')
                listado.limpiar()
              }}
            >
              Limpiar
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ResourceTable
            columnas={columnas}
            filas={listado.datos}
            claveDe={(partida) => partida.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay partidas'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otro término o quita el filtro de prefijo.'
                : 'Registra la primera partida presupuestaria.'
            }
            renderAcciones={(partida) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver ${partida.nombre}`}
                  onClick={() => setEnVista(partida)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${partida.nombre}`}
                    onClick={() => abrirEditar(partida)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${partida.nombre}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setAEliminar(partida)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          />

          <PaginationBar
            meta={listado.meta}
            pagina={listado.pagina}
            alCambiarPagina={listado.setPagina}
            cargando={listado.refrescando}
          />
        </CardContent>
      </Card>

      <PartidaFormDialog
        open={formOpen}
        onOpenChange={(abierto) => {
          setFormOpen(abierto)
          if (!abierto) setEnEdicion(null)
        }}
        key={enEdicion?.id ?? 'nueva'}
        partida={enEdicion}
        onSaved={() => setFormOpen(false)}
      />

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista?.nombre ?? 'Partida'}
        description="Detalle de la partida presupuestaria"
        maxWidth="md"
      >
        {enVista && <PartidaViewContent partida={enVista} />}
      </ViewDialog>

      <DeleteConfirmDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAEliminar(null)
        }}
        resourceName="partida"
        resourceLabel="partida presupuestaria"
        itemName={aEliminar ? `${aEliminar.codigo} — ${aEliminar.nombre}` : undefined}
        description={
          aEliminar
            ? `Se eliminará "${aEliminar.nombre}" de forma permanente. Si tiene actividades registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => {
          if (aEliminar) eliminar.mutate(aEliminar.id)
        }}
      />

      {!listado.cargando && listado.datos.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Hash className="h-3 w-3" />
          Cada actividad del POA se imputa a una única partida presupuestaria.
        </p>
      )}
    </div>
  )
}