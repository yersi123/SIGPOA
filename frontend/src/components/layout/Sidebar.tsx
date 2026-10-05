import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Menú lateral por rol.
 *
 * Los tres roles ven todos los catálogos porque la policy devuelve true en
 * viewAny para todos: el control social es de solo lectura, no sin acceso. Lo
 * que se oculta según el rol son los botones de crear, editar y borrar dentro
 * de cada página, no los módulos de lectura.
 */
const CATALOGOS = ['administrador', 'responsable', 'control_social']

const allLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/gestiones', label: 'Gestiones', roles: CATALOGOS },
  { to: '/entidades', label: 'Entidades', roles: CATALOGOS },
  { to: '/unidades', label: 'Unidades', roles: CATALOGOS },
  { to: '/partidas', label: 'Partidas', roles: CATALOGOS },
  { to: '/actividades', label: 'Actividades', roles: CATALOGOS },
  { to: '/gastos', label: 'Gastos', roles: CATALOGOS },
  { to: '/proveedores', label: 'Proveedores', roles: CATALOGOS },
  { to: '/contrataciones', label: 'Contrataciones', roles: CATALOGOS },
  { to: '/organizaciones', label: 'Organizaciones', roles: CATALOGOS },
  { to: '/propuestas', label: 'Propuestas', roles: CATALOGOS },
  { to: '/reportes/ejecucion', label: 'Reporte Ejecución' },
  { to: '/reportes/organizaciones', label: 'Reporte Organizaciones' },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const role = user?.rol

  // Sin rol no se pinta nada. Antes se caia el filtro `if (!role) return false`
  // y se mostraba el menu parcial: solo Dashboard y los dos reportes, que es
  // justo el estado degradado que se confundio con un cambio de permisos.
  if (!role) {
    return (
      <aside className="w-64 border-r bg-background">
        <nav className="space-y-1 p-4" aria-busy="true" aria-label="Menú lateral">
          {[0, 1, 2, 3].map((indice) => (
            <div key={indice} className="h-9 w-full animate-pulse rounded-md bg-muted" />
          ))}
        </nav>
      </aside>
    )
  }

  const filtered = allLinks.filter((link) => {
    if (!link.roles) return true
    return link.roles.includes(role)
  })

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="p-4 space-y-1">
        {filtered.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground ${
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
