export interface DashboardResumen {
  presupuesto_total?: number
  ejecutado?: number
  saldo?: number
  porcentaje_ejecucion?: number
  actividades_sobreejecutadas?: number
  actividades_total?: number
  [key: string]: unknown
}

export interface DashboardEjecucionPorUnidad {
  unidad_id: number
  unidad_nombre: string
  programado: number
  ejecutado: number
  porcentaje: number
}

export interface DashboardEjecucionPorOrganizacion {
  organizacion_id: number
  organizacion_nombre: string
  programado: number
  ejecutado: number
  porcentaje: number
}

export interface DashboardActividadSobreejecutada {
  actividad_id: number
  objetivo: string
  monto_programado: number
  monto_ejecutado: number
  porcentaje: number
}

export interface DashboardData {
  resumen: DashboardResumen
  por_unidad: DashboardEjecucionPorUnidad[]
  por_organizacion: DashboardEjecucionPorOrganizacion[]
  actividades_sobreejecutadas: DashboardActividadSobreejecutada[]
}
