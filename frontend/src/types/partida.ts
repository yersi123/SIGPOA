export interface Partida {
  id: number
  codigo: string
  nombre: string
  created_at?: string | null
  updated_at?: string | null
}

export interface PartidaFormData {
  codigo: string
  nombre: string
}

/** El formulario maneja el monto del codigo como texto para validar el regex. */
export interface PartidaFormValues {
  codigo: string
  nombre: string
}

export interface PartidaConNumero extends Partida {
  /** Etiqueta "25100 - Consultorias por producto" para el desplegable. */
  etiqueta?: string
}