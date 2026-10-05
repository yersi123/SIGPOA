import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Receipt } from 'lucide-react'

import { CampoSelect } from '@/components/common/campos/CampoSelect'
import { GastosActividadPanel } from '@/components/gastos/GastosActividadPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActividadesLookup, useGestionesLookup } from '@/hooks/useLookups'

/**
 * Gastos de una actividad (tareas 10.1, 10.2 y 10.4).
 *
 * El backend no expone un listado global de gastos ni un detalle por id: solo
 * existe `GET /actividades/{id}/gastos`. Por eso esta pagina pide primero una
 * actividad y muestra sus gastos con el mismo panel que usa el detalle de la
 * actividad, en lugar de inventar un listado que la API no tiene.
 *
 * La actividad elegida vive en la query para que el enlace sea compartible y
 * sobreviva a un F5.
 */
export function GastosPage() {
  const [parametros, setParametros] = useSearchParams()

  const actividades = useActividadesLookup()
  const gestiones = useGestionesLookup()

  const actividadIdBruto = parametros.get('actividad')
  const actividadId = Number(actividadIdBruto)
  const actividadSeleccionada =
    Number.isFinite(actividadId) && actividadId > 0
      ? (actividades.data ?? []).find((actividad) => actividad.id === actividadId)
      : undefined

  // Si la actividad de la query todavia no llego desde el catalogo, se espera a
  // que cargue en lugar de mostrar el panel con datos incompletos.
  const esperandoCatalogo =
    Number.isFinite(actividadId) && actividadId > 0 && !actividades.isPending && !actividadSeleccionada

  const opcionesActividad = useMemo(
    () =>
      (actividades.data ?? []).map((actividad) => ({
        valor: String(actividad.id),
        etiqueta: actividad.objetivo,
        secundario: `#${actividad.id}`,
      })),
    [actividades.data],
  )

  const gestionDe = (id: number) => gestiones.data?.find((gestion) => gestion.id === id)

  const cambiarActividad = (valor: string) => {
    // El desplegable no admite value="", asi que un id vacio se traduce a
    // limpiar la query en vez de a un "?actividad=" colgando.
    if (!valor) {
      setParametros({}, { replace: true })
      return
    }
    setParametros({ actividad: valor }, { replace: true })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gastos</h1>
        <p className="text-sm text-muted-foreground">
          Los gastos se registran siempre sobre una actividad del POA.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <CampoSelect
            id="gastos-actividad"
            label="Selecciona la actividad cuyos gastos quieres ver"
            valor={actividadSeleccionada ? String(actividadSeleccionada.id) : ''}
            onValorChange={cambiarActividad}
            placeholder={
              actividades.isPending ? 'Cargando actividades...' : 'Selecciona una actividad'
            }
            opciones={opcionesActividad}
            containerClassName="max-w-2xl"
          />
          {esperandoCatalogo && (
            <p className="mt-2 text-sm text-destructive">
              La actividad #{actividadId} no existe o no está a tu alcance.
            </p>
          )}
        </CardContent>
      </Card>

      {actividadSeleccionada && (
        <GastosActividadPanel
          actividadId={actividadSeleccionada.id}
          actividadObjetivo={actividadSeleccionada.objetivo}
          gestionAnio={gestionDe(actividadSeleccionada.gestion_id)?.anio}
          gestionCerrada={gestionDe(actividadSeleccionada.gestion_id)?.estado === 'cerrada'}
        />
      )}

      {!actividadSeleccionada && !esperandoCatalogo && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Elige una actividad</p>
          <p className="text-sm text-muted-foreground">
            Sus gastos y su total aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  )
}