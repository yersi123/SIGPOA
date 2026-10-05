import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Inbox, Pencil, Plus, Trash2, Users } from 'lucide-react'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { UnidadFormDialog } from '@/components/unidades/UnidadFormDialog'
import { UnidadViewContent } from '@/components/unidades/UnidadViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { useEntidadesLookup } from '@/hooks/useLookups'
import { useListadoRecurso, SIN_FILTRO } from '@/hooks/useListadoRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import { valorOguion } from '@/lib/formato'
import type { Unidad } from '@/types/unidad'

/**
 * Tarea 5.1: listado de unidades con filtro por entidad.
 *
 * La API solo acepta entidad_id en este listado, asi que el filtro es el
 * desplegable de entidad y no una caja de texto libre.
 */
export function UnidadesPage() {
  const { esAdmin } = usePermisos()
  const entidades = useEntidadesLookup()
  const catalogoEntidades = entidades.data ?? []

  const listado = useListadoRecurso<Unidad>({
    clave: 'unidades',
    ruta: '/unidades',
    filtrosIniciales: { entidad_id: SIN_FILTRO },
    porPagina: 10,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Unidad | null>(null)
  const [enVista, setEnVista] = useState<Unidad | null>(null)
  const [aEliminar, setAEliminar] = useState<Unidad | null>(null)

  const eliminar = useEliminarRecurso({
    clave: 'unidades',
    ruta: '/unidades',
    exito: 'Unidad eliminada correctamente.',
    generico: 'No se pudo eliminar la unidad.',
    conflicto: 'No se puede eliminar: la unidad tiene actividades asociadas.',
    alTerminar: () => setAEliminar(null),
  })

  /** Cruza entidad_id con el nombre resuelto del catalogo de entidades. */
  const nombreEntidad = (entidadId: number): string | undefined =>
    catalogoEntidades.find((entidad) => entidad.id === entidadId)?.nombre

  const columnas: ColumnaResource<Unidad>[] = [
    {
      clave: 'nombre',
      encabezado: 'Unidad',
      render: (unidad) => (
        <Link to={`/unidades/${unidad.id}`} className="font-medium text-foreground hover:underline">
          {unidad.nombre}
        </Link>
      ),
    },
    {
      clave: 'entidad',
      encabezado: 'Entidad',
      render: (unidad) => valorOguion(nombreEntidad(unidad.entidad_id)),
    },
    {
      clave: 'responsable',
      encabezado: 'Responsable',
      render: (unidad) => valorOguion(unidad.responsable),
      ocultarEnMovil: true,
    },
  ]

  const abrirCrear = () => {
    setEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (unidad: Unidad) => {
    setEnEdicion(unidad)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Unidades</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1 ? 'unidad registrada' : 'unidades registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva unidad
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <CampoSelect
            id="filtro-entidad"
            label="Entidad"
            valor={listado.filtros.entidad_id}
            onValorChange={(valor) => listado.setFiltro('entidad_id', valor)}
            placeholder="Todas las entidades"
            opciones={[
              { valor: SIN_FILTRO, etiqueta: 'Todas las entidades' },
              ...catalogoEntidades.map((entidad) => ({
                valor: String(entidad.id),
                etiqueta: entidad.nombre,
              })),
            ]}
            containerClassName="min-w-[240px]"
          />

          {listado.hayFiltros && (
            <Button variant="outline" onClick={listado.limpiar}>
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
            claveDe={(unidad) => unidad.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay unidades'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otra entidad o quita el filtro.'
                : 'Registra la primera unidad para empezar.'
            }
            renderAcciones={(unidad) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver ${unidad.nombre}`}
                  onClick={() => setEnVista(unidad)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${unidad.nombre}`}
                    onClick={() => abrirEditar(unidad)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${unidad.nombre}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setAEliminar(unidad)}
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

      <UnidadFormDialog
        open={formOpen}
        onOpenChange={(abierto) => {
          setFormOpen(abierto)
          if (!abierto) setEnEdicion(null)
        }}
        key={enEdicion?.id ?? 'nueva'}
        unidad={enEdicion}
        onSaved={() => setFormOpen(false)}
      />

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista?.nombre ?? 'Unidad'}
        description="Detalle de la unidad"
        maxWidth="md"
      >
        {enVista && (
          <UnidadViewContent
            unidad={enVista}
            entidadNombre={nombreEntidad(enVista.entidad_id)}
          />
        )}
      </ViewDialog>

      <DeleteConfirmDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAEliminar(null)
        }}
        resourceName="unidad"
        resourceLabel="unidad"
        itemName={aEliminar?.nombre}
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
          <Users className="h-3 w-3" />
          Las unidades son la unidad responsable de cada actividad del POA.
        </p>
      )}
    </div>
  )
}