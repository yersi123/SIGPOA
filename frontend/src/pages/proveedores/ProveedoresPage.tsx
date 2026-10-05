import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building, Eye, Inbox, Pencil, Plus, Trash2 } from 'lucide-react'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { ProveedorFormDialog } from '@/components/proveedores/ProveedorFormDialog'
import { ProveedorViewContent } from '@/components/proveedores/ProveedorViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { useListadoRecurso } from '@/hooks/useListadoRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearFecha, valorOguion } from '@/lib/formato'
import type { Proveedor } from '@/types/proveedor'

/**
 * Tarea 7.1: listado de proveedores.
 *
 * El unico filtro de la API es q, que busca por nombre o por NIT; el backend
 * lo resuelve con un unico ilike sobre los dos campos.
 */
export function ProveedoresPage() {
  const { esAdmin } = usePermisos()

  const listado = useListadoRecurso<Proveedor>({
    clave: 'proveedores',
    ruta: '/proveedores',
    filtrosIniciales: { q: '' },
    porPagina: 10,
  })

  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Proveedor | null>(null)
  const [enVista, setEnVista] = useState<Proveedor | null>(null)
  const [aEliminar, setAEliminar] = useState<Proveedor | null>(null)

  const eliminar = useEliminarRecurso({
    clave: 'proveedores',
    ruta: '/proveedores',
    exito: 'Proveedor eliminado correctamente.',
    generico: 'No se pudo eliminar el proveedor.',
    conflicto: 'No se puede eliminar: el proveedor tiene gastos o contrataciones asociadas.',
    alTerminar: () => setAEliminar(null),
  })

  const columnas: ColumnaResource<Proveedor>[] = [
    {
      clave: 'nombre',
      encabezado: 'Nombre',
      render: (proveedor) => (
        <Link
          to={`/proveedores/${proveedor.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {proveedor.nombre}
        </Link>
      ),
    },
    {
      clave: 'nit',
      encabezado: 'NIT',
      render: (proveedor) => (
        <span className="font-mono text-xs">{valorOguion(proveedor.nit)}</span>
      ),
    },
    {
      clave: 'telefono',
      encabezado: 'Teléfono',
      render: (proveedor) => valorOguion(proveedor.telefono),
      ocultarEnMovil: true,
    },
    {
      clave: 'actualizado',
      encabezado: 'Actualizado',
      render: (proveedor) => formatearFecha(proveedor.updated_at),
      ocultarEnMovil: true,
    },
  ]

  const abrirCrear = () => {
    setEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (proveedor: Proveedor) => {
    setEnEdicion(proveedor)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1 ? 'proveedor registrado' : 'proveedores registrados'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proveedor
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <form
            className="min-w-[260px] flex-1 space-y-1.5"
            onSubmit={(evento) => {
              evento.preventDefault()
              listado.setFiltro('q', q)
            }}
          >
            <Label htmlFor="filtro-q">Buscar por nombre o NIT</Label>
            <Input
              id="filtro-q"
              value={q}
              onChange={(evento) => setQ(evento.target.value)}
              placeholder="Escribe y pulsa Enter"
            />
          </form>

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
            claveDe={(proveedor) => proveedor.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay proveedores'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otro nombre o con otro NIT.'
                : 'Registra el primer proveedor para empezar.'
            }
            renderAcciones={(proveedor) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver ${proveedor.nombre}`}
                  onClick={() => setEnVista(proveedor)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${proveedor.nombre}`}
                    onClick={() => abrirEditar(proveedor)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${proveedor.nombre}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setAEliminar(proveedor)}
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

      <ProveedorFormDialog
        open={formOpen}
        onOpenChange={(abierto) => {
          setFormOpen(abierto)
          if (!abierto) setEnEdicion(null)
        }}
        key={enEdicion?.id ?? 'nueva'}
        proveedor={enEdicion}
        onSaved={() => setFormOpen(false)}
      />

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista?.nombre ?? 'Proveedor'}
        description="Detalle del proveedor"
        maxWidth="md"
      >
        {enVista && <ProveedorViewContent proveedor={enVista} />}
      </ViewDialog>

      <DeleteConfirmDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAEliminar(null)
        }}
        resourceName="proveedor"
        resourceLabel="proveedor"
        itemName={aEliminar?.nombre}
        description={
          aEliminar
            ? `Se eliminará "${aEliminar.nombre}" de forma permanente. Si tiene gastos o contrataciones registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => {
          if (aEliminar) eliminar.mutate(aEliminar.id)
        }}
      />

      {!listado.cargando && listado.datos.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building className="h-3 w-3" />
          El NIT es único: al repetirlo la base de datos rechaza el alta con un 409.
        </p>
      )}
    </div>
  )
}