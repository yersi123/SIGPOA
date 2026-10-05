import { useAuthStore } from '@/stores/auth.store'
import type { RolNombre } from '@/types/auth'

export interface Permisos {
  rol: RolNombre | null | undefined
  esAdmin: boolean
  esResponsable: boolean
  esControlSocial: boolean
  /**
   * R8: solo el administrador crea. El responsable y el control social no
   * generan registros nuevos.
   */
  puedeCrear: boolean
  /** R8: el borrado tambien es exclusivo del administrador. */
  puedeEliminar: boolean
  /**
   * R8: el administrador edita cualquier registro y el responsable edita los de
   * su unidad. El backend ya limita ese listado al scope de su unidad, asi que
   * en pantalla basta con ocultar el boton al control social.
   */
  puedeEditar: boolean
}

/**
 * Permisos de la regla R8 leidos del rol del usuario autenticado.
 *
 * Importante: estos flags solo controlan que se vea o no el boton. La
 * autorizacion real es la policy del backend, y los 403 se siguen mostrando.
 * No todos los recursos usan `puedeEditar`: entidades, unidades, partidas,
 * proveedores y organizaciones delegan en `puedeCrear`, asi que en ellas el
 * responsable tambien queda sin edicion.
 */
export function usePermisos(): Permisos {
  const rol = useAuthStore((state) => state.user?.rol)

  const esAdmin = rol === 'administrador'
  const esResponsable = rol === 'responsable'

  return {
    rol,
    esAdmin,
    esResponsable,
    esControlSocial: rol === 'control_social',
    puedeCrear: esAdmin,
    puedeEliminar: esAdmin,
    puedeEditar: esAdmin || esResponsable,
  }
}