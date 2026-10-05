import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, Inbox, Plus } from 'lucide-react'

import { EstadoBadge } from '@/components/common/EstadoBadge'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { PropuestaEstadoDialog } from '@/components/propuestas/PropuestaEstadoDialog'
import { PropuestaFormDialog } from '@/components/propuestas/PropuestaFormDialog'
import { PropuestaViewContent } from '@/components/propuestas/PropuestaViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SIN_FILTRO, useListadoRecurso } from '@/hooks/useListadoRecurso'
import {
  useActividadesLookup,
  useGestionesLookup,
  useOrganizacionesLookup,
} from '@/hooks/useLookups'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearMoneda, valorOguion } from '@/lib/formato'
import type { EstadoPropuesta, Propuesta } from '@/types/propuesta'

const ESTADOS: Array<{ valor: EstadoPropuesta; etiqueta: string }> = [
  { valor: 'propuesto', etiqueta: 'Propuesto' },
  { valor: 'aprobado', etiqueta: 'Aprobado' },
  { valor: 'en_ejecucion', etiqueta: 'En ejecución' },
  { valor: 'concluido', etiqueta: 'Concluido' },
]

interface PropuestaConNombres extends Propuesta {
  organizacionNombre?: string
  organizacionTipo?: string
  gestionAnio?: number
  actividadObjetivo?: string
}

/**
 * Listado de propuestas participativas (tareas 12.1 y 12.2).
 *
 * Igual que las contrataciones, no hay edicion ni borrado porque el backend no
 * expone `PUT` ni `DELETE` sobre propuestas. Lo unico que se mueve es el estado,
 * y el paso a aprobado exige imputar actividad y monto.
 */
export function PropuestasPage() {
  const { esAdmin, puedeEditar } = usePermisos()

  const listado = useListadoRecurso<Propuesta>({
    clave: 'propuestas',
    ruta: '/propuestas',
    filtrosIniciales: {
      estado: SIN_FILTRO,
      organizacion_id: SIN_FILTRO,
      gestion_id: SIN_FILTRO,
    },
    porPagina: 10,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [enVista, setEnVista] = useState<Propuesta | null>(null)
  const [enEstado, setEnEstado] = useState<Propuesta | null>(null)

  const organizaciones = useOrganizacionesLookup()
  const gestiones = useGestionesLookup()
  const actividades = useActividadesLookup()

  const conNombres = useMemo<PropuestaConNombres[]>(
    () =>
      listado.datos.map((propuesta) => {
        const organizacion = organizaciones.data?.find((o) => o.id === propuesta.organizacion_id)
        return {
          ...propuesta,
          organizacionNombre: organizacion?.nombre,
          organizacionTipo: organizacion?.tipo,
          gestionAnio: gestiones.data?.find((g) => g.id === propuesta.gestion_id)?.anio,
          actividadObjetivo: actividades.data?.find((a) => a.id === propuesta.actividad_id)?.objetivo,
        }
      }),
    [listado.datos, organizaciones.data, gestiones.data, actividades.data],
  )

  const columnas: ColumnaResource<PropuestaConNombres>[] = [
    {
      clave: 'titulo',
      encabezado: 'Título',
      render: (propuesta) => (
        <Link
          to={`/propuestas/${propuesta.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {propuesta.titulo}
        </Link>
      ),
    },
    {
      clave: 'organizacion',
      encabezado: 'Organización',
      render: (propuesta) => valorOguion(propuesta.organizacionNombre),
      ocultarEnMovil: true,
    },
    {
      clave: 'actividad',
      encabezado: 'Actividad',
      render: (propuesta) => valorOguion(propuesta.actividadObjetivo),
      ocultarEnMovil: true,
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (propuesta) => <EstadoBadge estado={propuesta.estado} />,
    },
    {
      clave: 'monto',
      encabezado: 'Monto',
      className: 'text-right font-medium text-foreground',
      render: (propuesta) => formatearMoneda(propuesta.monto_asignado),
    },
  ]

  const gestionDe = (propuesta: Propuesta) =>
    gestiones.data?.find((gestion) => gestion.id === propuesta.gestion_id)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propuestas participativas</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1
              ? 'propuesta registrada'
              : 'propuestas registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva propuesta
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
              id="filtro-propuesta-estado"
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
              id="filtro-propuesta-organizacion"
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

            <CampoSelect
              id="filtro-propuesta-gestion"
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
            claveDe={(propuesta) => propuesta.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay propuestas'}
            vacioDetalle={
              listado.hayFiltros ? 'Prueba con otros filtros.' : 'Registra la primera propuesta.'
            }
            renderAcciones={(propuesta) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver la propuesta ${propuesta.titulo}`}
                  onClick={() => setEnVista(propuesta)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* R8: el responsable avanza estados de su unidad, el control social no. */}
                {puedeEditar && propuesta.estado !== 'concluido' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Avanzar el estado de la propuesta"
                    onClick={() => setEnEstado(propuesta)}
                  >
                    <ArrowRight className="h-4 w-4" />
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

      <PropuestaFormDialog
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
        title={enVista?.titulo ?? 'Propuesta'}
        description="Detalle de la propuesta participativa"
        maxWidth="xl"
      >
        {enVista && (
          <PropuestaViewContent
            propuesta={enVista}
            organizacionNombre={conNombres.find((p) => p.id === enVista.id)?.organizacionNombre}
            organizacionTipo={conNombres.find((p) => p.id === enVista.id)?.organizacionTipo}
            gestionAnio={gestionDe(enVista)?.anio}
            gestionEstado={gestionDe(enVista)?.estado}
            actividadObjetivo={
              actividades.data?.find((a) => a.id === enVista.actividad_id)?.objetivo
            }
          />
        )}
      </ViewDialog>

      <PropuestaEstadoDialog
        // La key incluye el estado de la fila para que el dialogo se remonte y
        // sus valores por defecto correspondan a la propuesta abierta.
        key={enEstado?.id ?? 'ninguna'}
        open={enEstado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnEstado(null)
        }}
        propuesta={enEstado}
      />
    </div>
  )
}