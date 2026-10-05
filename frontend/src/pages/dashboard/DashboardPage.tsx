import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-resumen'],
    queryFn: async () => {
      const res = await api.get('/dashboard/resumen')
      return res.data?.data ?? res.data
    },
  })

  const resumen = (data as any) ?? {}

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(resumen.presupuesto_total ?? 0).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ejecutado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(resumen.ejecutado ?? 0).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(resumen.saldo ?? 0).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">% Ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(resumen.porcentaje_ejecucion ?? 0)}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
