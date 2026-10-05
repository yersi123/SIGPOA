<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UnidadRequest;
use App\Http\Resources\UnidadResource;
use App\Models\Unidad;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Tarea 3.5: Unidades en 5 endpoints, con filtro por entidad_id.
 */
class UnidadController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/unidades
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = Unidad::query()->with('entidad')->orderBy('nombre');

        if ($peticion->filled('entidad_id')) {
            $consulta->where('entidad_id', $peticion->integer('entidad_id'));
        }

        return response()->json($this->listado($consulta, $peticion, UnidadResource::class));
    }

    /**
     * GET /api/unidades/{id}
     */
    public function show(Unidad $unidad): JsonResponse
    {
        return $this->ok(UnidadResource::make($unidad->load('entidad')));
    }

    /**
     * POST /api/unidades
     */
    public function store(UnidadRequest $peticion): JsonResponse
    {
        $this->authorize('create', Unidad::class);

        $unidad = Unidad::create($peticion->validated());

        return $this->guardado(UnidadResource::make($unidad), 'Unidad creada correctamente.');
    }

    /**
     * PUT /api/unidades/{id}
     */
    public function update(UnidadRequest $peticion, Unidad $unidad): JsonResponse
    {
        $this->authorize('update', $unidad);

        $unidad->update($peticion->validated());

        return $this->ok(UnidadResource::make($unidad->fresh()), 'Unidad actualizada correctamente.');
    }

    /**
     * DELETE /api/unidades/{id}
     */
    public function destroy(Unidad $unidad): Response
    {
        $this->authorize('delete', $unidad);

        $unidad->delete();

        return $this->eliminado();
    }
}
