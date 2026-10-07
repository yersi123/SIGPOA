import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Building2,
  Trash2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { ViewDialog } from '@/components/common/ViewDialog'
import { EntidadFormDialog } from '@/components/entidades/EntidadFormDialog'
import { EntidadViewContent } from '@/components/entidades/EntidadViewContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import {
  ENTIDADES_POR_PAGINA,
  ENTIDAD_TIPOS,
  ENTIDAD_TIPO_LABELS,
  type Entidad,
  type EntidadConUnidades,
  type EntidadTipo,
} from '@/types/entidad'

const TODOS = 'todos'

interface EntidadesListResponse extends ApiResponse<Entidad[]> {}

export function EntidadesPage() {
  const queryClient = useQueryClient()
  const rol = useAuthStore((state) => state.user?.rol)

  // R8: solo el administrador escribe. El responsable y el control social
  // ven el listado pero no los botones de accion.
  const puedeEditar = rol === 'administrador'
  const puedeEliminar = rol === 'administrador'

  const [q, setQ] = useState('')

  // La pagina vive junto a los filtros en un solo objeto: al cambiar cualquier
  // filtro se reinicia a la 1 sin necesidad de un efecto.
  const [pagina, setPagina] = useState({ filtros: '', tipo: TODOS as EntidadTipo | typeof TODOS, numero: 1 })
  const page = pagina.numero

  const aplicarFiltros = (qNuevo: string, tipoNuevo: EntidadTipo | typeof TODOS) => {
    setPagina({ filtros: qNuevo, tipo: tipoNuevo, numero: 1 })
  }

  const [formOpen, setFormOpen] = useState(false)
  const [entidadEnEdicion, setEntidadEnEdicion] = useState<Entidad | null>(null)
  const [entidadEnVista, setEntidadEnVista] = useState<Entidad | null>(null)
  const [entidadAEliminar, setEntidadAEliminar] = useState<Entidad | null>(null)

  const parametros = useMemo(() => {
    const params = new URLSearchParams()
    if (pagina.filtros.trim()) params.set('q', pagina.filtros.trim())
    if (pagina.tipo !== TODOS) params.set('tipo', pagina.tipo)
    params.set('page', String(pagina.numero))
    params.set('per_page', String(ENTIDADES_POR_PAGINA))
    return params.toString()
  }, [pagina])

  const consulta = useQuery({
    queryKey: ['entidades', pagina.filtros, pagina.tipo, pagina.numero],
    queryFn: async () => {
      const respuesta = await api.get<EntidadesListResponse>(`/entidades?${parametros}`)
      return respuesta.data
    },
  })

  const consultaUnidades = useQuery({
    queryKey: ['entidades', 'unidades', entidadEnVista?.id],
    queryFn: async () => {
      const respuesta = await api.get<ApiResponse<EntidadConUnidades>>(
        `/entidades/${entidadEnVista!.id}/unidades`,
      )
      return respuesta.data.data
    },
    enabled: entidadEnVista !== null,
  })

  const datos = consulta.data?.data ?? []
  const meta = consulta.data?.meta
  const totalPaginas = meta?.last_page ?? 1
  const total = meta?.total ?? 0
  const mostrandoDesde = meta?.from ?? 0
  const mostrandoHasta = meta?.to ?? 0

  const abrirCrear = () => {
    setEntidadEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (entidad: Entidad) => {
    setEntidadEnEdicion(entidad)
    setFormOpen(true)
  }

  const guardar = () => {
    const eraEdicion = entidadEnEdicion !== null
    queryClient.invalidateQueries({ queryKey: ['entidades'] })
    setFormOpen(false)
    setEntidadEnEdicion(null)
    toast.success(eraEdicion ? 'Entidad actualizada correctamente.' : 'Entidad creada correctamente.')
  }

  const eliminar = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/entidades/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entidades'] })
      setEntidadAEliminar(null)
      toast.success('Entidad eliminada correctamente.')
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } }
      }
      const status = axiosError.response?.status

      // 409: la entidad esta en uso. El dialogo se cierra y se avisa con un toast.
      if (status === 409) {
        setEntidadAEliminar(null)
        queryClient.invalidateQueries({ queryKey: ['entidades'] })
        toast.error(
          axiosError.response?.data?.message ??
            'No se puede eliminar: la entidad tiene unidades u otros datos asociados.',
        )
        return
      }

      toast.error(axiosError.response?.data?.message ?? 'No se pudo eliminar la entidad.')
    },
  })

  const hayFiltros = pagina.filtros.trim() !== '' || pagina.tipo !== TODOS

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entidades</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'entidad registrada' : 'entidades registradas'}
          </p>
        </div>

        {puedeEditar && (
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva entidad
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label htmlFor="filtro-q">Buscar por nombre</Label>
            <form
              onSubmit={(evento) => {
                evento.preventDefault()
                aplicarFiltros(q, pagina.tipo)
              }}
            >
              <Input
                id="filtro-q"
                value={q}
                onChange={(evento) => setQ(evento.target.value)}
                placeholder="Escribe y pulsa Enter"
              />
            </form>
          </div>

          <div className="min-w-[200px] space-y-1.5">
            <Label htmlFor="filtro-tipo">Tipo</Label>
            <Select
              value={pagina.tipo}
              onValueChange={(valor: string) => aplicarFiltros(pagina.filtros, valor as EntidadTipo | typeof TODOS)}
            >
              <SelectTrigger id="filtro-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos los tipos</SelectItem>
                {ENTIDAD_TIPOS.map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {ENTIDAD_TIPO_LABELS[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hayFiltros && (
            <Button
              variant="outline"
              onClick={() => {
                setQ('')
                aplicarFiltros('', TODOS)
              }}
            >
              Limpiar
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Departamento</th>
                  <th className="px-4 py-3 font-medium">Municipio</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {consulta.isLoading &&
                  Array.from({ length: 5 }).map((_, indice) => (
                    <tr key={`esqueleto-${indice}`} className="border-b">
                      <td className="px-4 py-3" colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))}

                {!consulta.isLoading && datos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {hayFiltros ? 'Sin resultados' : 'Aún no hay entidades'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hayFiltros
                            ? 'Prueba con otro nombre o cambia el filtro de tipo.'
                            : 'Registra la primera entidad para empezar.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!consulta.isLoading &&
                  datos.map((entidad) => (
                    <tr key={entidad.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link
                          to={`/entidades/${entidad.id}`}
                          className="font-medium hover:underline"
                        >
                          {entidad.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ENTIDAD_TIPO_LABELS[entidad.tipo]}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{entidad.departamento}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entidad.municipio?.trim() ? entidad.municipio : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ver ${entidad.nombre}`}
                            onClick={() => setEntidadEnVista(entidad)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {puedeEditar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Editar ${entidad.nombre}`}
                              onClick={() => abrirEditar(entidad)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}

                          {puedeEliminar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Eliminar ${entidad.nombre}`}
                              className="text-destructive hover:text-destructive"
                              onClick={() => setEntidadAEliminar(entidad)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Mostrando {mostrandoDesde}-{mostrandoHasta} de {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || consulta.isFetching}
                  onClick={() =>
                    setPagina((actual) => ({ ...actual, numero: Math.max(1, actual.numero - 1) }))
                  }
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPaginas || consulta.isFetching}
                  onClick={() =>
                    setPagina((actual) => ({
                      ...actual,
                      numero: Math.min(totalPaginas, actual.numero + 1),
                    }))
                  }
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EntidadFormDialog
        open={formOpen}
        onOpenChange={(abierto) => {
          setFormOpen(abierto)
          if (!abierto) setEntidadEnEdicion(null)
        }}
        // key por entidad: al editar otra fila el dialogo se remonta con el
        // prefill correcto, sin necesitar un efecto para resetear el form.
        key={entidadEnEdicion?.id ?? 'nueva'}
        entidad={entidadEnEdicion}
        onSaved={guardar}
      />

      <ViewDialog
        open={entidadEnVista !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEntidadEnVista(null)
        }}
        title={entidadEnVista?.nombre ?? 'Entidad'}
        description="Detalle de la entidad y sus unidades"
        maxWidth="lg"
      >
        {entidadEnVista && (
          <EntidadViewContent
            entidad={entidadEnVista}
            unidades={consultaUnidades.data?.unidades ?? []}
            loadingUnidades={consultaUnidades.isLoading}
          />
        )}
      </ViewDialog>

      <DeleteConfirmDialog
        open={entidadAEliminar !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setEntidadAEliminar(null)
        }}
        resourceName="entidad"
        resourceLabel="entidad"
        itemName={entidadAEliminar?.nombre}
        description={
          entidadAEliminar
            ? `Se eliminará "${entidadAEliminar.nombre}" de forma permanente. Si tiene unidades asociadas, la base de datos rechazará la operación y no se borrará nada.`
            : undefined
        }
        isLoading={eliminar.isPending}
        onConfirm={() => {
          if (entidadAEliminar) eliminar.mutate(entidadAEliminar.id)
        }}
      />

      {consulta.isError && (
        <p className="flex items-center justify-center gap-2 text-sm text-destructive">
          <Building2 className="h-4 w-4" />
          No se pudo cargar el listado de entidades.
          <Loader2 className="h-3 w-3 animate-spin" />
        </p>
      )}
    </div>
  )
}
