/**
 * Lectura normalizada de los errores que devuelve la API.
 *
 * La API responde { success:false, message, errors:{campo:[mensajes]} } en los
 * 422 y en los 409, y { success:false, message } en el resto de codigos.
 * Los hooks de listado y de borrado, y los formularios, consume siempre esta
 * forma en vez de Reach para `response.data`, que no esta garantizado.
 */

export interface ErrorApi {
  status?: number
  message?: string
  errors?: Record<string, string[]>
}

export function leerErrorApi(error: unknown): ErrorApi {
  const axiosError = error as {
    response?: { status?: number; data?: ErrorApi }
  }

  return {
    status: axiosError.response?.status,
    message: axiosError.response?.data?.message,
    errors: axiosError.response?.data?.errors,
  }
}

/**
 * Primer mensaje de un campo concreto del 422, o null si el backend no lo
 * reporta. Los formularios lo pintan junto al campo en vez de en un toast.
 */
export function mensajeDeCampo(error: unknown, campo: string): string | null {
  return leerErrorApi(error).errors?.[campo]?.[0] ?? null
}