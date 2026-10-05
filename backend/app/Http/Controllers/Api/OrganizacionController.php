<?php

namespace App\Http\Controllers\Api;

use App\Enums\TipoOrganizacion;
use App\Http\Requests\OrganizacionRequest;
use App\Http\Resources\OrganizacionResource;
use App\Models\Organizacion;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * Tarea 3.11: Organizaciones en 5 endpoints.
 *
 * El filtro ?tipo= acepta OTB, sindicato, junta_vecinal y pueblo_indigena sin
 * distinguir mayusculas, y se compara contra el valor canonico que guarda el
 * CHECK ck_organizaciones_tipo.
 */
class OrganizacionController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/organizaciones
     */
    public function index(Request $peticion): JsonResponse
    {
        $peticion->validate([
            'tipo' => ['sometimes', 'string', 'max:30'],
        ]);

        $consulta = Organizacion::query()->orderBy('nombre');

        if ($peticion->filled('tipo')) {
            $tipo = TipoOrganizacion::fromLabel($peticion->string('tipo')->toString());

            if ($tipo === null) {
                throw ValidationException::withMessages([
                    'tipo' => 'El tipo debe ser OTB, sindicato, junta_vecinal o pueblo_indigena.',
                ]);
            }

            $consulta->where('tipo', $tipo->value);
        }

        return response()->json($this->listado($consulta, $peticion, OrganizacionResource::class));
    }

    /**
     * GET /api/organizaciones/{id}
     */
    public function show(Organizacion $organizacion): JsonResponse
    {
        return $this->ok(OrganizacionResource::make($organizacion));
    }

    /**
     * POST /api/organizaciones
     */
    public function store(OrganizacionRequest $peticion): JsonResponse
    {
        $this->authorize('create', Organizacion::class);

        $organizacion = Organizacion::create($peticion->validated());

        return $this->guardado(
            OrganizacionResource::make($organizacion),
            'Organizacion creada correctamente.',
        );
    }

    /**
     * PUT /api/organizaciones/{id}
     */
    public function update(OrganizacionRequest $peticion, Organizacion $organizacion): JsonResponse
    {
        $this->authorize('update', $organizacion);

        $organizacion->update($peticion->validated());

        return $this->ok(
            OrganizacionResource::make($organizacion->fresh()),
            'Organizacion actualizada correctamente.',
        );
    }

    /**
     * DELETE /api/organizaciones/{id}
     */
    public function destroy(Organizacion $organizacion): Response
    {
        $this->authorize('delete', $organizacion);

        $organizacion->delete();

        return $this->eliminado();
    }
}
