interface DatoCampoProps {
  label: string
  value: React.ReactNode
  /** Dato que ocupa todo el ancho de la fila, para textos largos. */
  anchoCompleto?: boolean
}

/** Par etiqueta/valor de las vistas de solo lectura. */
export function DatoCampo({ label, value, anchoCompleto = false }: DatoCampoProps) {
  return (
    <div className={anchoCompleto ? 'space-y-0.5 sm:col-span-2' : 'space-y-0.5'}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value ?? '—'}</div>
    </div>
  )
}