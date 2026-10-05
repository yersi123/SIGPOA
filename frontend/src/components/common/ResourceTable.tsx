import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ColumnaResource<T> {
  clave: string
  encabezado: string
  render: (fila: T) => ReactNode
  className?: string
  /** Oculta la columna en pantallas estrechas para que la tabla siga legible. */
  ocultarEnMovil?: boolean
}

interface ResourceTableProps<T> {
  columnas: ColumnaResource<T>[]
  filas: T[]
  claveDe: (fila: T) => number | string
  cargando: boolean
  /** Mensaje de error del listado; muestra un reintento en lugar de la tabla. */
  error?: string
  alReintentar?: () => void
  vacioTitulo: string
  vacioDetalle?: string
  iconoVacio?: ReactNode
  renderAcciones?: (fila: T) => ReactNode
  filasEsqueleto?: number
}

/**
 * Tabla de listado compartida por los recursos CRUD.
 *
 * Centraliza los tres estados que se repiten en cada pagina: los esqueletos de
 * carga, el mensaje de lista vacia y el error con su boton de reintento.
 */
export function ResourceTable<T>({
  columnas,
  filas,
  claveDe,
  cargando,
  error,
  alReintentar,
  vacioTitulo,
  vacioDetalle,
  iconoVacio,
  renderAcciones,
  filasEsqueleto = 5,
}: ResourceTableProps<T>) {
  const conAcciones = Boolean(renderAcciones)
  const totalColumnas = columnas.length + (conAcciones ? 1 : 0)

  if (error) {
    return (
      <div className="space-y-3 px-4 py-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
        {alReintentar && (
          <Button variant="outline" onClick={alReintentar}>
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columnas.map((columna) => (
              <th key={columna.clave} className={cn('px-4 py-3 font-medium', columna.className)}>
                {columna.encabezado}
              </th>
            ))}
            {conAcciones && <th className="px-4 py-3 text-right font-medium">Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {cargando &&
            Array.from({ length: filasEsqueleto }).map((_, indice) => (
              <tr key={`esqueleto-${indice}`} className="border-b">
                <td className="px-4 py-3" colSpan={totalColumnas}>
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ))}

          {!cargando && filas.length === 0 && (
            <tr>
              <td colSpan={totalColumnas} className="px-4 py-12">
                <div className="flex flex-col items-center gap-2 text-center">
                  {iconoVacio}
                  <p className="text-sm font-medium">{vacioTitulo}</p>
                  {vacioDetalle && <p className="text-sm text-muted-foreground">{vacioDetalle}</p>}
                </div>
              </td>
            </tr>
          )}

          {!cargando &&
            filas.map((fila) => (
              <tr key={claveDe(fila)} className="border-b last:border-0 hover:bg-muted/40">
                {columnas.map((columna) => (
                  <td
                    key={columna.clave}
                    className={cn('px-4 py-3 text-muted-foreground', columna.className)}
                  >
                    {columna.render(fila)}
                  </td>
                ))}
                {conAcciones && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">{renderAcciones?.(fila)}</div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}