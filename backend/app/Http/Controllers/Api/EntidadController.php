<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\EntidadRequest;
use App\Http\Resources\EntidadResource;
use App\Http\Resources\UnidadResource;
use App\Models\Entidad;
use App\Models\Unidad;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Tarea 3.4: Entidades en 5 endpoints.
 *
 * Ademas del CRUD, GET /api/entidades/{id}/unidades devuelve la entidad con sus
 * unidades ya anidadas.
 */
class EntidadController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/entidades
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = Entidad::query()
            ->with('unidades')
            ->orderBy('nombre');

        if ($peticion->filled('tipo')) {
            $consulta->where('tipo', $peticion->string('tipo')->toString());
        }

        if ($peticion->filled('q')) {
            $consulta->where('nombre', 'ilike', '%'.$peticion->string('q')->toString().'%');
        }

        return response()->json($this->listado($consulta, $peticion, EntidadResource::class));
    }

    /**
     * GET /api/entidades/{id}
     */
    public function show(Entidad $entidad): JsonResponse
    {
        return $this->ok(EntidadResource::make($entidad->load('unidades')));
    }

    /**
     * GET /api/entidades/{id}/unidades
     *
     * La entidad con sus unidades anidadas. Las unidades heredan el scope de la
     * tarea 2.9, asi que un responsable solo ve las de su unidad.
     */
    public function unidades(Entidad $entidad): JsonResponse
    {
        $entidad->load('unidades');

        return $this->ok([
            'entidad' => EntidadResource::make($entidad),
            'unidades' => UnidadResource::collection($entidad->unidades)->resolve(),
        ]);
    }

    /**
     * POST /api/entidades
     */
    public function store(EntidadRequest $peticion): JsonResponse
    {
        $this->authorize('create', Entidad::class);

        $entidad = Entidad::create($peticion->validated());

        return $this->guardado(EntidadResource::make($entidad), 'Entidad creada correctamente.');
    }

    /**
     * PUT /api/entidades/{id}
     */
    public function update(EntidadRequest $peticion, Entidad $entidad): JsonResponse
    {
        $this->authorize('update', $entidad);

        $entidad->update($peticion->validated());

        return $this->ok(EntidadResource::make($entidad->fresh()), 'Entidad actualizada correctamente.');
    }

    /**
     * DELETE /api/entidades/{id}
     */
    public function destroy(Entidad $entidad): Response
    {
        $this->authorize('delete', $entidad);

        $entidad->delete();

        return $this->eliminado();
    }
}
