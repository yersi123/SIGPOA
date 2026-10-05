import { AlertTriangle, Target, Wallet } from 'lucide-react'

import { DatoCampo } from '@/components/common/DatoCampo'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { aNumero, formatearFecha, formatearMoneda, formatearPorcentaje, valorOguion } from '@/lib/formato'
import { ORGANIZACION_TIPO_LABELS, type Organizacion } from '@/types/organizacion'
import type { ActividadEjecucion } from '@/types/actividad'

interface ActividadViewContentProps {
  actividad: {
    id: number
    objetivo: string
    meta?: string | null
    descripcion?: string | null
    monto_programado: number | string
  }
  unidadNombre?: string
  partidaCodigo?: string
  partidaNombre?: string
  organizacion?: Organizacion | null
  gestionAnio?: number
  ejecucion?: ActividadEjecucion
  cargandoEjecucion?: boolean
  mostrarFechas?: boolean
  created_at?: string | null
  updated_at?: string | null
}

/**
 * Cuerpo de solo lectura de una actividad, con el bloque de ejecucion.
 *
 * El saldo, el porcentaje y la marca de sobreejecutada llegan ya calculados
 * desde v_ejecucion_actividad; aqui solo se muestran. Si no hay fila en la
 * vista, se dibujan esqueletos mientras se consulta.
 */
export function ActividadViewContent({
  actividad,
  unidadNombre,
  partidaCodigo,
  partidaNombre,
  organizacion,
  gestionAnio,
  ejecucion,
  cargandoEjecucion = false,
  mostrarFechas = true,
  created_at,
  updated_at,
}: ActividadViewContentProps) {
  const programado = aNumero(actividad.monto_programado)
  const ejecutado = ejecucion ? aNumero(ejecucion.monto_ejecutado) : 0
  const saldo = ejecucion ? aNumero(ejecucion.saldo) : programado
  const porcentaje = ejecucion ? aNumero(ejecucion.porcentaje_ejecucion) : 0
  const sobreejecutada = ejecucion?.sobreejecutada ?? false

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{actividad.objetivo}</p>
          <p className="text-sm text-muted-foreground">{valorOguion(actividad.meta)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DatoCampo
          label="Gestión"
          value={gestionAnio !== undefined ? String(gestionAnio) : '—'}
        />
        <DatoCampo label="Unidad responsable" value={valorOguion(unidadNombre)} />
        <DatoCampo
          label="Partida presupuestaria"
          value={partidaCodigo ? `${partidaCodigo} — ${partidaNombre ?? ''}`.trim() : '—'}
        />
        <DatoCampo
          label="Organización"
          value={
            organizacion
              ? `${organizacion.nombre} (${ORGANIZACION_TIPO_LABELS[organizacion.tipo]})`
              : '—'
          }
        />
        <DatoCampo label="Descripción" value={valorOguion(actividad.descripcion)} anchoCompleto />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Ejecución presupuestaria
          </p>
          {ejecucion && sobreejecutada && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Sobreejecutada
            </Badge>
          )}
        </div>

        {cargandoEjecucion ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <Progress value={Math.min(100, Math.max(0, porcentaje))} className="h-2" />

            <div className="grid gap-3 sm:grid-cols-3">
              <DatoCampo label="Programado" value={formatearMoneda(programado)} />
              <DatoCampo label="Ejecutado" value={formatearMoneda(ejecutado)} />
              <DatoCampo
                label="Saldo"
                value={
                  <span className={saldo < 0 ? 'text-destructive' : undefined}>
                    {formatearMoneda(saldo)}
                  </span>
                }
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Porcentaje de ejecución: {formatearPorcentaje(porcentaje)}
            </p>
          </>
        )}
      </div>

      {mostrarFechas && (
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <DatoCampo label="Creada" value={formatearFecha(created_at)} />
          <DatoCampo label="Actualizada" value={formatearFecha(updated_at)} />
        </div>
      )}
    </div>
  )
}