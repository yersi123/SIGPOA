import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Inbox, Pencil, Plus, Trash2, Users } from 'lucide-react'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { OrganizacionFormDialog } from '@/components/organizaciones/OrganizacionFormDialog'
import { OrganizacionViewContent } from '@/components/organizaciones/OrganizacionViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import { useListadoRecurso, SIN_FILTRO } from '@/hooks/useListadoRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import { valorOguion } from '@/lib/formato'
import {
  ORGANIZACION_TIPO_LABELS,
  TIPOS_ORGANIZACION,
  type Organizacion,
} from '@/types/organizacion'

/**
 * Tarea 8.1: listado de organizaciones con filtro por tipo.
 *
 * El filtro viaja con el valor canonico del enum; el backend ademas acepta
 * cualquiera de las dos capitalizaciones, pero desde aqui siempre se manda el
 * canonico para no depender de esa tolerancia. "Todos los tipos" usa SIN_FILTRO,
 * que `useListadoRecurso` omite de la query: la API rechaza cualquier tipo que
 * no sea del enum con un 422.
 */
export function OrganizacionesPage() {
  const { esAdmin } = usePermisos()

  const listado = useListadoRecurso<Organizacion>({
    clave: 'organizaciones',
    ruta: '/organizaciones',
    filtrosIniciales: { tipo: SIN_FILTRO },
    porPagina: 10,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Organizacion | null>(null)
  const [enVista, setEnVista] = useState<Organizacion | null>(null)
  const [aEliminar, setAEliminar] = useState<Organizacion | null>(null)

  const eliminar = useEliminarRecurso({
    clave: 'organizaciones',
    ruta: '/organizaciones',
    exito: 'Organización eliminada correctamente.',
    generico: 'No se pudo eliminar la organización.',
    conflicto: 'No se puede eliminar: la organización tiene propuestas participativas asociadas.',
    alTerminar: () => setAEliminar(null),
  })

  const columnas: ColumnaResource<Organizacion>[] = [
    {
      clave: 'nombre',
      encabezado: 'Organización',
      render: (organizacion) => (
        <Link
          to={`/organizaciones/${organizacion.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {organizacion.nombre}
        </Link>
      ),
    },
    {
      clave: 'tipo',
      encabezado: 'Tipo',
      render: (organizacion) => ORGANIZACION_TIPO_LABELS[organizacion.tipo],
    },
    {
      clave: 'personeria',
      encabezado: 'Personería jurídica',
      render: (organizacion) => (
        <span className="font-mono text-xs">{valorOguion(organizacion.personeria_juridica)}</span>
      ),
      ocultarEnMovil: true,
    },
    {
      clave: 'representante',
      encabezado: 'Representante',
      render: (organizacion) => valorOguion(organizacion.representante),
      ocultarEnMovil: true,
    },
  ]

  const abrirCrear = () => {
    setEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (organizacion: Organizacion) => {
    setEnEdicion(organizacion)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizaciones</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1
              ? 'organización registrada'
              : 'organizaciones registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva organización
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <CampoSelect
            id="filtro-tipo"
            label="Tipo"
            valor={listado.filtros.tipo}
            onValorChange={(valor) => listado.setFiltro('tipo', valor)}
            placeholder="Todos los tipos"
            opciones={[
              { valor: SIN_FILTRO, etiqueta: 'Todos los tipos' },
              ...TIPOS_ORGANIZACION.map((valor) => ({
                valor,
                etiqueta: ORGANIZACION_TIPO_LABELS[valor],
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
            claveDe={(organizacion) => organizacion.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay organizaciones'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otro tipo o quita el filtro.'
                : 'Registra la primera organización social.'
            }
            renderAcciones={(organizacion) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver ${organizacion.nombre}`}
                  onClick={() => setEnVista(organizacion)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${organizacion.nombre}`}
                    onClick={() => abrirEditar(organizacion)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${organizacion.nombre}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setAEliminar(organizacion)}
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

      <OrganizacionFormDialog
        open={formOpen}
        onOpenChange={(abierto) => {
          setFormOpen(abierto)
          if (!abierto) setEnEdicion(null)
        }}
        key={enEdicion?.id ?? 'nueva'}
        organizacion={enEdicion}
        onSaved={() => setFormOpen(false)}
      />

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista?.nombre ?? 'Organización'}
        description="Detalle de la organización social"
        maxWidth="md"
      >
        {enVista && <OrganizacionViewContent organizacion={enVista} />}
      </ViewDialog>

      <DeleteConfirmDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAEliminar(null)
        }}
        resourceName="organización"
        resourceLabel="organización"
        itemName={aEliminar?.nombre}
        description={
          aEliminar
            ? `Se eliminará "${aEliminar.nombre}" de forma permanente. Si tiene propuestas participativas registradas, la base de datos rechazará la operación con un 409 y no se borrará nada.`
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
          Las organizaciones pueden proponer actividades al POA mediante propuestas
          participativas.
        </p>
      )}
    </div>
  )
}