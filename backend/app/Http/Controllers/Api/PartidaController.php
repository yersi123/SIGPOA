<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\PartidaRequest;
use App\Http\Resources\PartidaResource;
use App\Models\Partida;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Tarea 3.6: Partidas presupuestarias en 5 endpoints.
 *
 * El codigo se valida contra el CHECK ck_partidas_codigo de la base, que exige
 * 5 o 6 digitos: un codigo de 4 digitos se rechaza con 422 en PartidaRequest.
 */
class PartidaController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/partidas
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = Partida::query()->orderBy('codigo');

        if ($peticion->filled('q')) {
            $consulta->where(function ($q) use ($peticion): void {
                $termino = '%'.$peticion->string('q')->toString().'%';
                $q->where('nombre', 'ilike', $termino)->orWhere('codigo', 'ilike', $termino);
            });
        }

        if ($peticion->filled('prefijo')) {
            $consulta->where('codigo', 'like', $peticion->string('prefijo')->toString().'%');
        }

        return response()->json($this->listado($consulta, $peticion, PartidaResource::class));
    }

    /**
     * GET /api/partidas/{id}
     */
    public function show(Partida $partida): JsonResponse
    {
        return $this->ok(PartidaResource::make($partida));
    }

    /**
     * POST /api/partidas
     */
    public function store(PartidaRequest $peticion): JsonResponse
    {
        $this->authorize('create', Partida::class);

        $partida = Partida::create($peticion->validated());

        return $this->guardado(PartidaResource::make($partida), 'Partida creada correctamente.');
    }

    /**
     * PUT /api/partidas/{id}
     */
    public function update(PartidaRequest $peticion, Partida $partida): JsonResponse
    {
        $this->authorize('update', $partida);

        $partida->update($peticion->validated());

        return $this->ok(PartidaResource::make($partida->fresh()), 'Partida actualizada correctamente.');
    }

    /**
     * DELETE /api/partidas/{id}
     */
    public function destroy(Partida $partida): Response
    {
        $this->authorize('delete', $partida);

        $partida->delete();

        return $this->eliminado();
    }
}
