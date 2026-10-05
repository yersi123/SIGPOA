import type { EstadoContratacion } from '@/types/contratacion'
import type { EstadoPropuesta } from '@/types/propuesta'

/**
 * Etiqueta y color de los estados de contratacion y de propuesta participativa.
 *
 * Vive fuera de un componente a proposito: `EstadoBadge` lo importa para pintar
 * el distintivo, y los hooks de cambio de estado lo usan para los textos de los
 * botones sin tener que arrastrar un componente.
 *
 * Los valores son los del enum del backend: no se traducen ni se inventan
 * estados nuevos, porque un texto distinto haria que un PATCH de estado fuera
 * rechazado con 422.
 */
export const ESTADOS_GESTIONABLES = {
  solicitud: { etiqueta: 'Solicitud', clase: 'bg-slate-100 text-slate-700 border-slate-200' },
  cotizacion: { etiqueta: 'Cotización', clase: 'bg-sky-100 text-sky-700 border-sky-200' },
  adjudicada: { etiqueta: 'Adjudicada', clase: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  propuesto: { etiqueta: 'Propuesto', clase: 'bg-slate-100 text-slate-700 border-slate-200' },
  aprobado: { etiqueta: 'Aprobado', clase: 'bg-sky-100 text-sky-700 border-sky-200' },
  en_ejecucion: { etiqueta: 'En ejecución', clase: 'bg-amber-100 text-amber-700 border-amber-200' },
  concluido: { etiqueta: 'Concluido', clase: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
} as const satisfies Record<EstadoContratacion | EstadoPropuesta, { etiqueta: string; clase: string }>

export type EstadoGestionable = EstadoContratacion | EstadoPropuesta

/** Texto legible de un estado, para dialogos y botones. */
export function etiquetaEstado(estado: EstadoGestionable): string {
  return ESTADOS_GESTIONABLES[estado]?.etiqueta ?? estado
}
