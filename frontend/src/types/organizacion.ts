/**
 * Valores canonicos de TipoOrganizacion en la base de datos.
 *
 * OJO: el enum del backend guarda OTB en mayusculas y los otros tres en
 * minusculas, porque asi lo fija el CHECK ck_organizaciones_tipo. El valor
 * 'otb' en minusculas NO existe en la base y por eso no se usa aqui.
 */
export const TIPOS_ORGANIZACION = ['OTB', 'sindicato', 'junta_vecinal', 'pueblo_indigena'] as const

export type TipoOrganizacion = (typeof TIPOS_ORGANIZACION)[number]

export const ORGANIZACION_TIPO_LABELS: Record<TipoOrganizacion, string> = {
  OTB: 'OTB',
  sindicato: 'Sindicato',
  junta_vecinal: 'Junta Vecinal',
  pueblo_indigena: 'Pueblo Indígena',
}

export interface Organizacion {
  id: number
  nombre: string
  tipo: TipoOrganizacion
  personeria_juridica?: string | null
  representante?: string | null
  telefono?: string | null
  direccion?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface OrganizacionFormData {
  nombre: string
  tipo: TipoOrganizacion
  personeria_juridica?: string | null
  representante?: string | null
  telefono?: string | null
  direccion?: string | null
}

export interface OrganizacionFormValues {
  nombre: string
  tipo: TipoOrganizacion | ''
  personeria_juridica: string
  representante: string
  telefono: string
  direccion: string
}