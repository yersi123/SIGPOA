/**
 * Constantes de sesion compartidas entre el cliente HTTP y el store.
 *
 * Viven en un modulo aparte, y no en auth.store.ts, porque api.ts necesita el
 * nombre del evento y auth.store.ts ya importa api.ts. Si api.ts importara el
 * store para leer la constante, se cerraria un ciclo de imports.
 */
export const EVENTO_SESION_EXPIRADA = 'auth:expired'