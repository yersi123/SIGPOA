<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Paginado unificado de los listados de la API.
 *
 * Todos los endpoints que devuelven colecciones usan esta clase para que el
 * formato sea identico en toda la API: ?page= y ?per_page=, con 15 registros
 * por defecto y un maximo de 100, y la metadata dentro de meta.
 */
final class Paginador
{
    public const POR_PAGINA_POR_DEFECTO = 15;

    public const MAXIMO_POR_PAGINA = 100;

    /**
     * Aplica la paginacion al constructor de la consulta.
     */
    public function aplicar(Builder $consulta, Request $peticion): LengthAwarePaginator
    {
        return $consulta->paginate(
            perPage: $this->porPagina($peticion),
            page: $peticion->integer('page', 1),
        );
    }

    /**
     * Numero de registros por pagina solicitado, acotado al maximo permitido.
     */
    public function porPagina(Request $peticion): int
    {
        $pedido = $peticion->integer('per_page', self::POR_PAGINA_POR_DEFECTO);

        if ($pedido < 1) {
            return self::POR_PAGINA_POR_DEFECTO;
        }

        return min($pedido, self::MAXIMO_POR_PAGINA);
    }

    /**
     * Envuelve el paginador en la envoltura estandar de la API.
     *
     * @param  array<int, mixed>  $items  Ya transformados por el resource.
     * @return array<string, mixed>
     */
    public function envelopar(LengthAwarePaginator $paginador, array $items): array
    {
        return [
            'success' => true,
            'message' => null,
            'data' => $items,
            'meta' => [
                'total' => $paginador->total(),
                'current_page' => $paginador->currentPage(),
                'last_page' => $paginador->lastPage(),
                'per_page' => $paginador->perPage(),
                'from' => $paginador->firstItem(),
                'to' => $paginador->lastItem(),
            ],
        ];
    }
}
