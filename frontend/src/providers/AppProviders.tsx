import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthBootstrap } from '@/components/auth/AuthBootstrap'
import { SessionExpiryNotice } from '@/components/auth/SessionExpiryNotice'
import { router } from '@/router/AppRouter'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status
        if (status === 401 || status === 403 || status === 404) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthBootstrap va dentro del QueryClientProvider porque loadMe() usa el
          cliente de axios y necesita montar antes de pintar el router. Fuera del
          RouterProvider a proposito: debe correr tambien en la ruta /login, que
          es justamente donde el bootstrap decide si hay sesion o no. */}
      <AuthBootstrap>
        {/* Avisa y cierra la sesion al caducar el token. No pinta nada, solo
            mantiene un temporizador contra el expires_at del login. */}
        <SessionExpiryNotice />
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" expand closeButton duration={6000} />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
