import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
  },
  {
    // Todas las rutas de modulos cuelgan de ProtectedRoute. Sin este guard la
    // app no tenia proteccion alguna: entrar directo a /actividades sin sesion
    // renderizaba el armazon con el menu vacio.
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/gestiones',
        lazy: async () => ({ Component: () => <div className="p-6">Gestiones</div> }),
      },
      {
        path: '/gestiones/:id',
        lazy: async () => ({ Component: () => <div className="p-6">Detalle Gestión</div> }),
      },
{
        path: '/entidades',
        lazy: async () => ({ Component: (await import('@/pages/entidades/EntidadesPage')).EntidadesPage }),
      },
      {
        path: '/entidades/:id',
        lazy: async () => ({
          Component: (await import('@/pages/entidades/EntidadDetallePage')).EntidadDetallePage,
        }),
      },
{
        path: '/unidades',
        lazy: async () => ({
          Component: (await import('@/pages/unidades/UnidadesPage')).UnidadesPage,
        }),
      },
      {
        path: '/unidades/:id',
        lazy: async () => ({
          Component: (await import('@/pages/unidades/UnidadDetallePage')).UnidadDetallePage,
        }),
      },
      {
        path: '/partidas',
        lazy: async () => ({
          Component: (await import('@/pages/partidas/PartidasPage')).PartidasPage,
        }),
      },
      {
        path: '/partidas/:id',
        lazy: async () => ({
          Component: (await import('@/pages/partidas/PartidaDetallePage')).PartidaDetallePage,
        }),
      },
{
        path: '/actividades',
        lazy: async () => ({
          Component: (await import('@/pages/actividades/ActividadesPage')).ActividadesPage,
        }),
      },
      {
        path: '/actividades/:id',
        lazy: async () => ({
          Component: (await import('@/pages/actividades/ActividadDetallePage'))
            .ActividadDetallePage,
        }),
      },
      {
        path: '/gastos',
        lazy: async () => ({
          Component: (await import('@/pages/gastos/GastosPage')).GastosPage,
        }),
      },
{
        path: '/proveedores',
        lazy: async () => ({
          Component: (await import('@/pages/proveedores/ProveedoresPage')).ProveedoresPage,
        }),
      },
      {
        path: '/proveedores/:id',
        lazy: async () => ({
          Component: (await import('@/pages/proveedores/ProveedorDetallePage'))
            .ProveedorDetallePage,
        }),
      },
      {
        path: '/contrataciones',
        lazy: async () => ({
          Component: (await import('@/pages/contrataciones/ContratacionesPage')).ContratacionesPage,
        }),
      },
      {
        path: '/contrataciones/:id',
        lazy: async () => ({
          Component: (await import('@/pages/contrataciones/ContratacionDetallePage'))
            .ContratacionDetallePage,
        }),
      },
{
        path: '/organizaciones',
        lazy: async () => ({
          Component: (await import('@/pages/organizaciones/OrganizacionesPage'))
            .OrganizacionesPage,
        }),
      },
      {
        path: '/organizaciones/:id',
        lazy: async () => ({
          Component: (await import('@/pages/organizaciones/OrganizacionDetallePage'))
            .OrganizacionDetallePage,
        }),
      },
      {
        path: '/propuestas',
        lazy: async () => ({
          Component: (await import('@/pages/propuestas/PropuestasPage')).PropuestasPage,
        }),
      },
      {
        path: '/propuestas/:id',
        lazy: async () => ({
          Component: (await import('@/pages/propuestas/PropuestaDetallePage'))
            .PropuestaDetallePage,
        }),
      },
      {
        path: '/reportes/ejecucion',
        lazy: async () => ({ Component: () => <div className="p-6">Reporte Ejecución</div> }),
      },
{
        path: '/reportes/organizaciones',
        lazy: async () => ({ Component: () => <div className="p-6">Reporte Organizaciones</div> }),
      },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
