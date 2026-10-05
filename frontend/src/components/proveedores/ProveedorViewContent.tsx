import { Building } from 'lucide-react'

import { DatoCampo } from '@/components/common/DatoCampo'
import { formatearFecha, valorOguion } from '@/lib/formato'
import type { Proveedor } from '@/types/proveedor'

interface ProveedorViewContentProps {
  proveedor: Proveedor
  mostrarFechas?: boolean
}

/** Cuerpo de solo lectura de un proveedor, compartido por el modal y el detalle. */
export function ProveedorViewContent({
  proveedor,
  mostrarFechas = true,
}: ProveedorViewContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Building className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{proveedor.nombre}</p>
          <p className="text-sm text-muted-foreground">
            NIT: {valorOguion(proveedor.nit)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DatoCampo label="NIT" value={valorOguion(proveedor.nit)} />
        <DatoCampo label="Teléfono" value={valorOguion(proveedor.telefono)} />
        <DatoCampo label="Dirección" value={valorOguion(proveedor.direccion)} anchoCompleto />
      </div>

      {mostrarFechas && (
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <DatoCampo label="Creado" value={formatearFecha(proveedor.created_at)} />
          <DatoCampo label="Actualizado" value={formatearFecha(proveedor.updated_at)} />
        </div>
      )}
    </div>
  )
}