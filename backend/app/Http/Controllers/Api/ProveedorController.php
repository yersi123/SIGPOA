<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ProveedorRequest;
use App\Http\Resources\ProveedorResource;
use App\Models\Proveedor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Tarea 3.9: Proveedores en 5 endpoints, con ?q= por nombre o NIT.
 */
class ProveedorController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/proveedores
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = Proveedor::query()->orderBy('nombre');

        if ($peticion->filled('q')) {
            $consulta->where(function (Builder $q) use ($peticion): void {
                $termino = '%'.$peticion->string('q')->toString().'%';
                $q->where('nombre', 'ilike', $termino)->orWhere('nit', 'ilike', $termino);
            });
        }

        return response()->json($this->listado($consulta, $peticion, ProveedorResource::class));
    }

    /**
     * GET /api/proveedores/{id}
     */
    public function show(Proveedor $proveedor): JsonResponse
    {
        return $this->ok(ProveedorResource::make($proveedor));
    }

    /**
     * POST /api/proveedores
     */
    public function store(ProveedorRequest $peticion): JsonResponse
    {
        $this->authorize('create', Proveedor::class);

        $proveedor = Proveedor::create($peticion->validated());

        return $this->guardado(ProveedorResource::make($proveedor), 'Proveedor creado correctamente.');
    }

    /**
     * PUT /api/proveedores/{id}
     */
    public function update(ProveedorRequest $peticion, Proveedor $proveedor): JsonResponse
    {
        $this->authorize('update', $proveedor);

        $proveedor->update($peticion->validated());

        return $this->ok(ProveedorResource::make($proveedor->fresh()), 'Proveedor actualizado correctamente.');
    }

    /**
     * DELETE /api/proveedores/{id}
     */
    public function destroy(Proveedor $proveedor): Response
    {
        $this->authorize('delete', $proveedor);

        $proveedor->delete();

        return $this->eliminado();
    }
}
