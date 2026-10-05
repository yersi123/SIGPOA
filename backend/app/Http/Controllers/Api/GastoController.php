<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GastoRequest;
use App\Http\Resources\GastoResource;
use App\Models\Actividad;
use App\Models\Gasto;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/**
 * Tarea 3.8: Gastos en 3 endpoints.
 *
 * El alta va por sp_registrar_gasto, que devuelve el p_gasto_id (INOUT) y es la
 * que aplica la regla R4. No hay endpoint de edicion: un gasto se corrige
 * borrandolo y registrandolo de nuevo.
 */
class GastoController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/actividades/{id}/gastos
     */
    public function index(Actividad $actividad): JsonResponse
    {
        $gastos = Gasto::query()
            ->with('proveedor')
            ->where('actividad_id', $actividad->id)
            ->orderByDesc('fecha')
            ->get();

        return $this->ok(GastoResource::collection($gastos)->resolve());
    }

    /**
     * POST /api/gastos
     */
    public function store(GastoRequest $peticion): JsonResponse
    {
        $this->authorize('create', Gasto::class);

        $datos = $peticion->validated();

        // sp_registrar_gasto es un PROCEDURE con un INOUT (p_gasto_id). Se invoca
        // con CALL y, por el INOUT, PDO espera un septimo bind: los seis de
        // entrada y un null de salida que PostgreSQL rellena y devuelve.
        $gastoId = DB::transaction(function () use ($datos, $peticion): int {
            $resultado = DB::select('CALL sp_registrar_gasto(?, ?, ?, ?, ?, ?, ?)', [
                $datos['actividad_id'],
                $datos['proveedor_id'] ?? null,
                $datos['fecha'],
                $datos['monto'],
                $datos['detalle'] ?? null,
                $peticion->user()->id,
                null,
            ]);

            $id = $resultado[0]->p_gasto_id ?? null;

            if ($id === null) {
                abort(500, 'El procedimiento no devolvio el identificador del gasto.');
            }

            return (int) $id;
        });

        return $this->guardado(
            GastoResource::make(Gasto::with('proveedor')->findOrFail($gastoId)),
            'Gasto registrado correctamente.',
        );
    }

    /**
     * DELETE /api/gastos/{id}
     */
    public function destroy(Gasto $gasto): Response
    {
        $this->authorize('delete', $gasto);

        $gasto->delete();

        return $this->eliminado();
    }
}
