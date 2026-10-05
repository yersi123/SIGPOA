<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CerrarGestionRequest;
use App\Http\Resources\GestionResource;
use App\Models\Gestion;
use App\Support\Auditoria;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tarea 3.3: Gestiones en 3 endpoints.
 *
 * Solo lectura y cierre. El cierre va por sp_cerrar_gestion para que las reglas
 * de negocio las decida la base de datos y no el backend.
 */
class GestionController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/gestiones
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = Gestion::query()->orderByDesc('anio')->orderByDesc('id');

        if ($peticion->filled('estado')) {
            $consulta->where('estado', $peticion->string('estado')->toString());
        }

        return response()->json($this->listado($consulta, $peticion, GestionResource::class));
    }

    /**
     * GET /api/gestiones/{id}
     */
    public function show(Gestion $gestion): JsonResponse
    {
        return $this->ok(GestionResource::make($gestion));
    }

    /**
     * POST /api/gestiones/{id}/cerrar
     *
     * La operacion completa va dentro de una transaccion: se cierra la gestion y
     * se registra la auditoria, o no se toca nada.
     */
    public function cerrar(CerrarGestionRequest $peticion, Gestion $gestion): JsonResponse
    {
        $this->authorize('cerrar-gestion', $gestion);

        DB::transaction(function () use ($peticion, $gestion): void {
            // sp_cerrar_gestion es un PROCEDURE de PostgreSQL, no una funcion:
            // se invoca con CALL, no con SELECT.
            DB::select('CALL sp_cerrar_gestion(?)', [$gestion->id]);

            Auditoria::cierreGestion($peticion->user(), ['gestion_id' => $gestion->id]);
        });

        return $this->ok(
            GestionResource::make($gestion->fresh()),
            'Gestion cerrada correctamente.',
        );
    }
}
