<?php

namespace App\Http\Controllers\Api;

use App\Support\Paginador;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;

/**
 * Base de los controladores de la API.
 *
 * Concentra el formato de las respuestas para que todos los endpoints
 * respondan con la misma forma: success, message y data.
 */
abstract class ApiController
{
    protected Paginador $paginador;

    public function __construct()
    {
        $this->paginador = new Paginador;
    }

    /**
     * Respuesta de exito con un recurso unico.
     */
    protected function ok(mixed $datos, ?string $mensaje = null, int $codigo = 200): JsonResponse
    {
        if ($datos instanceof JsonResource) {
            $datos = $datos->response()->getData(true)['data'] ?? null;
        }

        return response()->json([
            'success' => true,
            'message' => $mensaje,
            'data' => $datos,
        ], $codigo);
    }

    /**
     * Respuesta de exito para un recurso recien creado o actualizado.
     */
    protected function guardado(mixed $datos, string $mensaje, int $codigo = 201): JsonResponse
    {
        return $this->ok($datos, $mensaje, $codigo);
    }

    /**
     * Respuesta 204 para borrados, sin cuerpo.
     *
     * La tarea 5.3 exige 204 en DELETE, y un 204 no admite cuerpo: el mensaje
     * lo compone el frontend, no la API.
     */
    protected function eliminado(): Response
    {
        return response()->noContent();
    }

    /**
     * Pagina la consulta y devuelve los items ya transformados por el resource.
     *
     * @param  class-string<JsonResource>  $recurso
     * @return array<string, mixed>
     */
    protected function listado(Builder $consulta, Request $peticion, string $recurso): array
    {
        $paginador = $this->paginador->aplicar($consulta, $peticion);

        return $this->paginador->envelopar(
            $paginador,
            $recurso::collection($paginador->getCollection())->resolve($peticion),
        );
    }

    /**
     * Atajo cuando el paginador ya existe.
     *
     * @param  class-string<JsonResource>  $recurso
     * @return array<string, mixed>
     */
    protected function envolver(LengthAwarePaginator $paginador, string $recurso): array
    {
        return $this->paginador->envelopar(
            $paginador,
            $recurso::collection($paginador->getCollection())->resolve(),
        );
    }
}
