export type EstadoGestion = 'abierta' | 'cerrada'

/**
 * La gestion expone solo cinco campos: el backend no tiene fecha_apertura ni
 * fecha_cierre (GestionResource responde id, anio, estado y timestamps), y el
 * unico cambio de estado posible es cerrar, que va por sp_cerrar_gestion.
 */
export interface Gestion {
  id: number
  anio: number
  estado: EstadoGestion
  created_at: string
  updated_at: string
}

/**
 * Payload del alta (POST /gestiones). Solo viaja el año: el backend fuerza el
 * estado a 'cerrada' y la activacion se hace aparte con /gestiones/:id/abrir.
 */
export interface GestionFormData {
  anio: number
}
