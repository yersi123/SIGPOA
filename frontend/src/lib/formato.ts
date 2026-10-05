/**
 * Formateo de valores para mostrar en las vistas de solo lectura.
 *
 * Vive fuera de los componentes para no ensuciar los archivos .tsx con
 * funciones sueltas.
 */

/** Texto que puede venir null desde la base: los opcionales muestran un guion. */
export function valorOguion(valor?: string | number | null): string {
  if (valor === null || valor === undefined) return '—'
  const texto = String(valor).trim()
  return texto === '' ? '—' : texto
}

/** Convierte a numero lo que llegue como string decimal de PostgreSQL. */
export function aNumero(valor?: number | string | null): number {
  if (valor === null || valor === undefined || valor === '') return 0
  const numero = typeof valor === 'number' ? valor : Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

const formatoMoneda = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Monto con separador de miles y dos decimales. */
export function formatearMoneda(valor?: number | string | null): string {
  return formatoMoneda.format(aNumero(valor))
}

/** Porcentaje de ejecucion con un decimal. */
export function formatearPorcentaje(valor?: number | null): string {
  return `${aNumero(valor).toFixed(1)} %`
}

/** Fecha y hora legible, o el guion si no hay fecha. */
export function formatearFecha(iso?: string | null): string {
  if (!iso) return '—'

  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleString('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}