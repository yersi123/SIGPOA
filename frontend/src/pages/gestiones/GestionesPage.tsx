import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Inbox, Lock, Plus, Unlock } from 'lucide-react'
import { toast } from 'sonner'

import { EstadoBadge } from '@/components/common/EstadoBadge'
import { PaginationBar } from '@/components/common/PaginationBar'
import { ResourceTable, type ColumnaResource } from '@/components/common/ResourceTable'
import { ViewDialog } from '@/components/common/ViewDialog'
import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { GestionAbrirDialog } from '@/components/gestiones/GestionAbrirDialog'
import { GestionCerrarDialog } from '@/components/gestiones/GestionCerrarDialog'
import { GestionFormDialog } from '@/components/gestiones/GestionFormDialog'
import { GestionViewContent } from '@/components/gestiones/GestionViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SIN_FILTRO, useListadoRecurso } from '@/hooks/useListadoRecurso'
import { useGestionAbierta } from '@/hooks/useGestionAbierta'
import { usePermisos } from '@/hooks/usePermisos'
import { formatearFecha } from '@/lib/formato'
import type { Gestion } from '@/types/gestion'

/** Opciones del filtro de estado, alineadas con el enum del backend. */
const ESTADOS: Array<{ valor: 'abierta' | 'cerrada'; etiqueta: string }> = [
  { valor: 'abierta', etiqueta: 'Abierta' },
  { valor: 'cerrada', etiqueta: 'Cerrada' },
]

/**
 * Listado de gestiones (tarea 3.1) con alta (3.4) y activacion (3.5).
 *
 * Una gestion nueva nace cerrada. Abrirla es exclusivo del administrador y solo
 * si no hay otra abierta (regla R1): por eso el boton "Activar" se deshabilita
 * mientras exista una gestion abierta.
 */
export function GestionesPage() {
  const { esAdmin } = usePermisos()
  const queryClient = useQueryClient()

  const listado = useListadoRecurso<Gestion>({
    clave: 'gestiones',
    ruta: '/gestiones',
    filtrosIniciales: { estado: SIN_FILTRO },
    porPagina: 10,
  })

  const { gestionAbierta } = useGestionAbierta()

  const [enVista, setEnVista] = useState<Gestion | null>(null)
  const [aCerrar, setACerrar] = useState<Gestion | null>(null)
  const [aActivar, setAActivar] = useState<Gestion | null>(null)
  const [crearOpen, setCrearOpen] = useState(false)

  const columnas: ColumnaResource<Gestion>[] = [
    {
      clave: 'anio',
      encabezado: 'Año',
      render: (gestion) => (
        <Link
          to={`/gestiones/${gestion.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {gestion.anio}
        </Link>
      ),
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (gestion) => <EstadoBadge estado={gestion.estado} />,
    },
    {
      clave: 'creada',
      encabezado: 'Creada',
      render: (gestion) => formatearFecha(gestion.created_at),
      ocultarEnMovil: true,
    },
    {
      clave: 'actualizada',
      encabezado: 'Actualizada',
      render: (gestion) => formatearFecha(gestion.updated_at),
      ocultarEnMovil: true,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestiones</h1>
          <p className="text-sm text-muted-foreground">
            {listado.meta?.total ?? 0}{' '}
            {(listado.meta?.total ?? 0) === 1 ? 'gestión registrada' : 'gestiones registradas'}
          </p>
        </div>

        {esAdmin && (
          <Button onClick={() => setCrearOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva gestión
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] space-y-1.5">
            <CampoSelect
              id="filtro-gestion-estado"
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
            filas={listado.datos}
            claveDe={(gestion) => gestion.id}
            cargando={listado.cargando}
            error={listado.error}
            alReintentar={listado.recargar}
            iconoVacio={<Inbox className="h-8 w-8 text-muted-foreground" />}
            vacioTitulo={listado.hayFiltros ? 'Sin resultados' : 'Aún no hay gestiones'}
            vacioDetalle={
              listado.hayFiltros
                ? 'Prueba con otro filtro de estado.'
                : 'Crea la primera gestión de planificación presupuestaria.'
            }
            renderAcciones={(gestion) => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver la gestión ${gestion.anio}`}
                  onClick={() => setEnVista(gestion)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* Activar: solo admin y si la gestión esta cerrada. */}
                {esAdmin && gestion.estado === 'cerrada' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Activar la gestión ${gestion.anio}`}
                    title={
                      gestionAbierta
                        ? `Cierra la gestión ${gestionAbierta.anio} antes de activar otra.`
                        : `Activar la gestión ${gestion.anio}`
                    }
                    disabled={gestionAbierta !== null}
                    onClick={() => setAActivar(gestion)}
                  >
                    <Unlock className="h-4 w-4" />
                  </Button>
                )}

                {/* Cerrar: exclusivo del administrador y solo si sigue abierta. */}
                {esAdmin && gestion.estado === 'abierta' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Cerrar la gestión ${gestion.anio}`}
                    onClick={() => setACerrar(gestion)}
                  >
                    <Lock className="h-4 w-4" />
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

      <ViewDialog
        open={enVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEnVista(null)
        }}
        title={enVista ? `Gestión ${enVista.anio}` : 'Gestión'}
        description="Detalle de la gestión"
        maxWidth="md"
      >
        {enVista && <GestionViewContent gestion={enVista} />}
      </ViewDialog>

      <GestionCerrarDialog
        open={aCerrar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setACerrar(null)
        }}
        gestion={aCerrar}
      />

      <GestionAbrirDialog
        open={aActivar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setAActivar(null)
        }}
        gestion={aActivar}
      />

      <GestionFormDialog
        open={crearOpen}
        onOpenChange={setCrearOpen}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['gestiones'] })
          setCrearOpen(false)
          toast.success('Gestión creada correctamente.')
        }}
      />
    </div>
  )
}