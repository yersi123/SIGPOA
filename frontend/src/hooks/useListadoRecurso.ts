import { useCallback, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common'

interface OpcionesListado {
  /** Clave raiz del cache de react-query, p. ej. 'unidades'. */
  clave: string
  /** Ruta del listado, p. ej. '/unidades'. */
  ruta: string
  /** Filtros iniciales; su forma define las claves que acepta `setFiltro`. */
  filtrosIniciales: Record<string, string>
  porPagina: number
  /** Activa la consulta. */
  habilitado?: boolean
}

/**
 * Valor centinela de "sin filtro" en los desplegables.
 *
 * No puede ser cadena vacia porque el <Select> de Radix rechaza un item con
 * value="". La API no admite este valor: lo trata como un enum invalido y
 * devuelve 422, asi que el hook lo quita de la query antes de enviarla.
 */
export const SIN_FILTRO = 'todos'

/** Un filtro sin valor real no debe viajar en la query. */
function esSinFiltro(valor: string): boolean {
  const limpio = valor.trim()
  return limpio === '' || limpio === SIN_FILTRO
}

/**
 * Estado de un listado paginado con filtros: filtros, pagina, parametros de la
 * consulta y datos ya desempaquetados.
 *
 * El numero de pagina vive junto a los filtros, de modo que cambiar cualquier
 * filtro vuelve a la pagina 1 sin necesitar un efecto que lo sincronice.
 */
export function useListadoRecurso<T>(opciones: OpcionesListado) {
  const { clave, ruta, filtrosIniciales, porPagina, habilitado = true } = opciones

  const [filtros, setFiltros] = useState<Record<string, string>>(filtrosIniciales)
  const [pagina, setPagina] = useState(1)

  const filtrosVacios = useMemo(
    () => Object.keys(filtrosIniciales).length === 0,
    [filtrosIniciales],
  )

  /** Asigna un filtro y vuelve a la primera pagina. */
  const setFiltro = useCallback((campo: string, valor: string) => {
    setFiltros((actual) => (actual[campo] === valor ? actual : { ...actual, [campo]: valor }))
    setPagina(1)
  }, [])

  /** Restaura los filtros iniciales y vuelve a la primera pagina. */
  const limpiar = useCallback(() => {
    setFiltros(filtrosIniciales)
    setPagina(1)
  }, [filtrosIniciales])

  const hayFiltros = useMemo(
    () => !filtrosVacios && Object.values(filtros).some((valor) => !esSinFiltro(valor)),
    [filtros, filtrosVacios],
  )

  const parametros = useMemo(() => {
    const query = new URLSearchParams()

    for (const [campo, valor] of Object.entries(filtros)) {
      if (!esSinFiltro(valor)) query.set(campo, valor.trim())
    }

    query.set('page', String(pagina))
    query.set('per_page', String(porPagina))

    return query.toString()
  }, [filtros, pagina, porPagina])

  const consulta = useQuery({
    queryKey: [clave, filtros, pagina],
    queryFn: async () => {
      const respuesta = await api.get<PaginatedResponse<T>>(`${ruta}?${parametros}`)
      return respuesta.data
    },
    // Mantiene la tabla visible mientras llegan los datos de la pagina siguiente
    // en lugar de parpadear a los esqueletos.
    placeholderData: keepPreviousData,
    enabled: habilitado,
  })

  return {
    datos: (consulta.data?.data ?? []) as T[],
    meta: consulta.data?.meta,
    cargando: consulta.isPending,
    refrescando: consulta.isFetching,
    error: consulta.isError ? 'No se pudo cargar el listado.' : undefined,
    recargar: consulta.refetch,
    filtros,
    setFiltro,
    hayFiltros,
    limpiar,
    pagina,
    setPagina,
  }
}