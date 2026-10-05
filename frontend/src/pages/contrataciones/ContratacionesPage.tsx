import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Gavel, Inbox, Plus } from 'lucide-react'

import { EstadoBadge } from '@/components/common/EstadoBadge'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { ContratacionEstadoDialog } from '@/components/contrataciones/ContratacionEstadoDialog'
import { ContratacionFormDialog } from '@/components/contrataciones/ContratacionFormDialog'
import { ContratacionViewContent } from '@/components/contrataciones/ContratacionViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SIN_FILTRO, useListadoRecurso } from '@/hooks/useListadoRecurso'
import { useActividadesLookup, useProveedoresLookup } from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearFecha, formatearMoneda, valorOguion } from '@/lib/formato'
import type { Contratacion, EstadoContratacion } from '@/types/contratacion'

/** Filtros y etiquetas de los tres estados de ContratacionRequest. */
const ESTADOS: Array<{ valor: EstadoContratacion; etiqueta: string }> = [
  { valor: 'solicitud', etiqueta: 'Solicitud' },
  { valor: 'cotizacion', etiqueta: 'Cotización' },
  { valor: 'adjudicada', etiqueta: 'Adjudicada' },
]

interface ContratacionConNombres extends Contratacion {
  actividadObjetivo?: string
  proveedorNombre?: string
}

/**
 * Listado de contrataciones (tareas 11.1 y 11.2).
 *
 * No hay columna de edicion ni de borrado porque el backend no expone
 * `PUT /contrataciones/{id}` ni `DELETE /contrataciones/{id}`: ambos responden
 * 405. Lo que si permite la API es crear y avanzar el estado, asi que las
 * acciones son ver y marcar el siguiente estado.
 */
export function ContratacionesPage() {
  const { esAdmin, puedeEditar } = usePermisos()

  const listado = useListadoRecurso<Contratacion>({
    clave: 'contrataciones',
    ruta: '/contrataciones',
    filtrosIniciales: {
      estado: SIN_FILTRO,
      actividad_id: SIN_FILTRO,
      proveedor_id: SIN_FILTRO,
    },
    porPagina: 10,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [enVista, setEnVista] = useState<Contratacion | null>(null)
  const [enEstado, setEnEstado] = useState<Contratacion | null>(null)

  const actividades = useActividadesLookup()
  const proveedores = useProveedoresLookup()

  const conNombres = useMemo<ContratacionConNombres[]>(
    () =>
      listado.datos.map((contratacion) => ({
        ...contratacion,
        actividadObjetivo: actividades.data?.find(
          (actividad) => actividad.id === contratacion.actividad_id,
        )?.objetivo,
        proveedorNombre: proveedores.data?.find(
          (proveedor) => proveedor.id === contratacion.proveedor_id,
        )?.nombre,
      })),
    [listado.datos, actividades.data, proveedores.data],
  )

  const columnas: ColumnaResource<ContratacionConNombres>[] = [
    {
      clave: 'descripcion',
      encabezado: 'Descripción',
      render: (contratacion) => (
        <Link
          to={`/contrataciones/${contratacion.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {valorOguion(contratacion.descripcion)}
        </Link>
      ),
    },
    {
      clave: 'actividad',
      encabezado: 'Actividad',
      render: (contratacion) => valorOguion(contratacion.actividadObjetivo),
      ocultarEnMovil: true,
    },
    {
      clave: 'proveedor',
      encabezado: 'Proveedor',
      render: (contratacion) => valorOguion(contratacion.proveedorNombre),
      ocultarEnMovil: true,
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (contratacion) => <EstadoBadge estado={contratacion.estado} />,
    },
    {
      clave: 'monto',
      encabezado: 'Monto',
      className: 'text-right font-medium text-foreground',
      render: (contratacion) => formatearMoneda(contratacion.monto_cotizado),
    },
    {
      clave: 'fecha',
      encabezado: 'Fecha',
      render: (contratacion) => formatearFecha(contratacion.fecha),
      ocultarEnMovil: true,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contrataciones</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1
              ? 'contratación registrada'
              : 'contrataciones registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva contratación
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CampoSelect
              id="filtro-contratacion-estado"
              label="Estado"
              valor={listado.filtros.estado}
              onValorChange={(valor) => listado.setFiltro('estado', valor)}
              placeholder="Todos"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todos' },
                ...ESTADOS.map((estado) => ({
                  valor: estado.valor,
                  etiqueta: estado.etiqueta,
                })),
              ]}
            />

            <CampoSelect
              id="filtro-contratacion-actividad"
              label="Actividad"
              valor={listado.filtros.actividad_id}
              onValorChange={(valor) => listado.setFiltro('actividad_id', valor)}
              placeholder="Todas"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todas' },
                ...(actividades.data ?? []).map((actividad) => ({
                  valor: String(actividad.id),
                  etiqueta: actividad.objetivo,
                })),
              ]}
            />

            <CampoSelect
              id="filtro-contratacion-proveedor"
              label="Proveedor"
              valor={listado.filtros.proveedor_id}
              onValorChange={(valor) => listado.setFiltro('proveedor_id', valor)}
              placeholder="Todos"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todos' },
                ...(proveedores.data ?? []).map((proveedor) => ({
                  valor: String(proveedor.id),
                  etiqueta: proveedor.nombre,
                })),
              ]}
            />
          </div>

          {listado.hayFiltros && (
            <Button variant="outline" onClick={() => listado.limpiar()}>
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ResourceTable
            columnas={columnas}
            filas={conNombres}
            claveDe={(contratacion) => contratacion.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay contrataciones'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otros filtros.'
                : 'Registra la primera contratación del POA.'
            }
            renderAcciones={(contratacion) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver la contratación ${contratacion.descripcion ?? contratacion.id}`}
                  onClick={() => setEnVista(contratacion)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* R8: el responsable avanza estados de su unidad, el control social no. */}
                {puedeEditar && contratacion.estado !== 'adjudicada' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Avanzar el estado de la contratación"
                    onClick={() => setEnEstado(contratacion)}
                  >
                    <Gavel className="h-4 w-4" />
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

      <ContratacionFormDialog
        key={formOpen ? 'nueva-abierta' : 'nueva'}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() => setFormOpen(false)}
      />

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista?.descripcion ?? 'Contratación'}
        description="Detalle de la contratación"
        maxWidth="xl"
      >
        {enVista && (
          <ContratacionViewContent
            contratacion={enVista}
            actividadObjetivo={
              actividades.data?.find((a) => a.id === enVista.actividad_id)?.objetivo
            }
            proveedorNombre={proveedores.data?.find((p) => p.id === enVista.proveedor_id)?.nombre}
          />
        )}
      </ViewDialog>

      <ContratacionEstadoDialog
        open={enEstado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnEstado(null)
        }}
        contratacion={enEstado}
      />
    </div>
  )
}