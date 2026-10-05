import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Eye, Inbox, Pencil, Plus, Trash2 } from 'lucide-react'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { ActividadFormDialog } from '@/components/actividades/ActividadFormDialog'
import { ActividadViewContent } from '@/components/actividades/ActividadViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEliminarRecurso } from '@/hooks/useEliminarRecurso'
import {
  useGestionesLookup,
  useOrganizacionesLookup,
  usePartidasLookup,
  useUnidadesLookup,
} from '@/hooks/useLookups'
import { useListadoRecurso, SIN_FILTRO } from '@/hooks/useListadoRecurso'
import { usePermisos } from '@/hooks/usePermisos'
import api from '@/lib/api'
import { aNumero, formatearMoneda, valorOguion } from '@/lib/formato'
import type { ApiResponse } from '@/types/common'
import type { Actividad, ActividadConNombres, ActividadEjecucion } from '@/types/actividad'

/**
 * Tarea 9.1: listado de actividades del POA.
 *
 * ActividadResource no expone las relaciones anidadas, asi que los nombres de
 * gestion, unidad, partida y organizacion se resuelven con consultas aparte y se
 * cruzan por id en `conNombres`.
 */
export function ActividadesPage() {
  const { esAdmin, puedeEditar } = usePermisos()

  const listado = useListadoRecurso<Actividad>({
    clave: 'actividades',
    ruta: '/actividades',
    filtrosIniciales: {
      gestion_id: SIN_FILTRO,
      unidad_id: SIN_FILTRO,
      partida_id: SIN_FILTRO,
      organizacion_id: SIN_FILTRO,
    },
    porPagina: 10,
  })

  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Actividad | null>(null)
  const [enVista, setEnVista] = useState<Actividad | null>(null)
  const [aEliminar, setAEliminar] = useState<Actividad | null>(null)

  const unidades = useUnidadesLookup()
  const partidas = usePartidasLookup()
  const organizaciones = useOrganizacionesLookup()
  const gestiones = useGestionesLookup()

  // La ejecucion solo se pide para la fila abierta en el ViewDialog, no para
  // toda la pagina: evita una peticion por cada fila de la tabla.
  const consultaEjecucion = useQuery({
    queryKey: ['actividades', 'ejecucion', enVista?.id],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<ActividadEjecucion>>(
        `/actividades/${enVista!.id}/ejecucion`,
      )
      return respuesta.data.data
    },
    enabled: enVista !== null,
  })

  const eliminar = useEliminarRecurso({
    clave: 'actividades',
    ruta: '/actividades',
    exito: 'Actividad eliminada correctamente.',
    generico: 'No se pudo eliminar la actividad.',
    conflicto: 'No se puede eliminar: la actividad tiene gastos o contrataciones asociadas.',
    alTerminar: () => setAEliminar(null),
  })

  /** Cruza las relaciones por id para poder pintar nombres en la tabla. */
  const conNombres = useMemo<ActividadConNombres[]>(
    () =>
      (listado.datos as Actividad[]).map((actividad) => {
        const unidad = unidades.data?.find((u) => u.id === actividad.unidad_id)
        const partida = partidas.data?.find((p) => p.id === actividad.partida_id)
        const gestion = gestiones.data?.find((g) => g.id === actividad.gestion_id)
        const organizacion = organizaciones.data?.find(
          (o) => o.id === actividad.organizacion_id,
        )

        return {
          ...actividad,
          unidadNombre: unidad?.nombre,
          partidaCodigo: partida?.codigo,
          partidaNombre: partida?.nombre,
          gestionAnio: gestion?.anio,
          gestionEstado: gestion?.estado,
          organizacionNombre: organizacion?.nombre,
        }
      }),
    [
      listado.datos,
      unidades.data,
      partidas.data,
      organizaciones.data,
      gestiones.data,
    ],
  )

  const columnas: ColumnaResource<ActividadConNombres>[] = [
    {
      clave: 'objetivo',
      encabezado: 'Objetivo',
      render: (actividad) => (
        <Link
          to={`/actividades/${actividad.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {actividad.objetivo}
        </Link>
      ),
    },
    {
      clave: 'unidad',
      encabezado: 'Unidad',
      render: (actividad) => valorOguion(actividad.unidadNombre),
      ocultarEnMovil: true,
    },
    {
      clave: 'partida',
      encabezado: 'Partida',
      render: (actividad) =>
        actividad.partidaCodigo ? (
          <span className="font-mono text-xs">{actividad.partidaCodigo}</span>
        ) : (
          '—'
        ),
      ocultarEnMovil: true,
    },
    {
      clave: 'monto',
      encabezado: 'Programado',
      render: (actividad) => formatearMoneda(actividad.monto_programado),
    },
  ]

  const abrirCrear = () => {
    setEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (actividad: Actividad) => {
    setEnEdicion(actividad)
    setFormOpen(true)
  }

  const gestionDe = (actividad: Actividad) =>
    gestiones.data?.find((g) => g.id === actividad.gestion_id)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Actividades del POA</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1
              ? 'actividad registrada'
              : 'actividades registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva actividad
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CampoSelect
              id="filtro-gestion"
              label="Gestión"
              valor={listado.filtros.gestion_id}
              onValorChange={(valor) => listado.setFiltro('gestion_id', valor)}
              placeholder="Todas"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todas' },
                ...(gestiones.data ?? []).map((gestion) => ({
                  valor: String(gestion.id),
                  etiqueta: `${gestion.anio} (${gestion.estado})`,
                })),
              ]}
            />

            <CampoSelect
              id="filtro-unidad"
              label="Unidad"
              valor={listado.filtros.unidad_id}
              onValorChange={(valor) => listado.setFiltro('unidad_id', valor)}
              placeholder="Todas"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todas' },
                ...(unidades.data ?? []).map((unidad) => ({
                  valor: String(unidad.id),
                  etiqueta: unidad.nombre,
                })),
              ]}
            />

            <CampoSelect
              id="filtro-partida"
              label="Partida"
              valor={listado.filtros.partida_id}
              onValorChange={(valor) => listado.setFiltro('partida_id', valor)}
              placeholder="Todas"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todas' },
                ...(partidas.data ?? []).map((partida) => ({
                  valor: String(partida.id),
                  etiqueta: `${partida.codigo} — ${partida.nombre}`,
                })),
              ]}
            />

            <CampoSelect
              id="filtro-organizacion"
              label="Organización"
              valor={listado.filtros.organizacion_id}
              onValorChange={(valor) => listado.setFiltro('organizacion_id', valor)}
              placeholder="Todas"
              opciones={[
                { valor: SIN_FILTRO, etiqueta: 'Todas' },
                ...(organizaciones.data ?? []).map((organizacion) => ({
                  valor: String(organizacion.id),
                  etiqueta: organizacion.nombre,
                })),
              ]}
            />
          </div>

          <form
            className="min-w-[240px] max-w-md space-y-1.5"
            onSubmit={(evento) => {
              evento.preventDefault()
              listado.setFiltro('q', q)
            }}
          >
            <Label htmlFor="filtro-q">Buscar en objetivo, meta o descripción</Label>
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
            claveDe={(actividad) => actividad.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay actividades'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otros filtros o búscalas por texto.'
                : 'Registra la primera actividad del POA.'
            }
            renderAcciones={(actividad) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver ${actividad.objetivo}`}
                  onClick={() => setEnVista(actividad)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {puedeEditar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${actividad.objetivo}`}
                    onClick={() => abrirEditar(actividad)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {esAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${actividad.objetivo}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setAEliminar(actividad)}
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

      <ActividadFormDialog
        open={formOpen}
        onOpenChange={(abierto) => {
          setFormOpen(abierto)
          if (!abierto) setEnEdicion(null)
        }}
        key={enEdicion?.id ?? 'nueva'}
        actividad={enEdicion}
        onSaved={() => setFormOpen(false)}
      />

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista?.objetivo ?? 'Actividad'}
        description="Detalle de la actividad y su ejecución"
        maxWidth="xl"
      >
        {enVista && (
          <ActividadViewContent
            actividad={enVista}
            unidadNombre={conNombres.find((a) => a.id === enVista.id)?.unidadNombre}
            partidaCodigo={conNombres.find((a) => a.id === enVista.id)?.partidaCodigo}
            partidaNombre={conNombres.find((a) => a.id === enVista.id)?.partidaNombre}
            organizacion={
              organizaciones.data?.find((o) => o.id === enVista.organizacion_id) ?? null
            }
            gestionAnio={gestionDe(enVista)?.anio}
            ejecucion={consultaEjecucion.data}
            cargandoEjecucion={consultaEjecucion.isPending}
          />
        )}
      </ViewDialog>

      <DeleteConfirmDialog
        open={aEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAEliminar(null)
        }}
        resourceName="actividad"
        resourceLabel="actividad"
        itemName={aEliminar?.objetivo}
        description={
          aEliminar
            ? `Se eliminará "${aEliminar.objetivo}" de forma permanente. Si tiene gastos o contrataciones registradas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => {
          if (aEliminar) eliminar.mutate(aEliminar.id)
        }}
      />

      {!listado.cargando && conNombres.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Suma programada:{' '}
          {formatearMoneda(
            conNombres.reduce((total, actividad) => total + aNumero(actividad.monto_programado), 0),
          )}{' '}
          en esta página.
        </p>
      )}
    </div>
  )
}