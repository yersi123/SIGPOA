<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CambiarEstadoPropuestaRequest;
use App\Http\Requests\PropuestaRequest;
use App\Http\Resources\PropuestaResource;
use App\Models\PropuestaParticipativa;
use App\Support\Auditoria;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tarea 3.12: Propuestas participativas en 4 endpoints.
 *
 * El cambio de estado va por sp_cambiar_estado_propuesta, que aplica la regla R5
 * de la base: propuesto -> aprobado -> en_ejecucion -> concluido, sin saltos ni
 * retrocesos.
 */
class PropuestaController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/propuestas
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = PropuestaParticipativa::query()
            ->with('organizacion', 'actividad')
            ->orderByDesc('id');

        foreach (['estado', 'organizacion_id', 'gestion_id', 'actividad_id'] as $campo) {
            if ($peticion->filled($campo)) {
                $consulta->where($campo, $peticion->string($campo)->toString());
            }
        }

        return response()->json($this->listado($consulta, $peticion, PropuestaResource::class));
    }

    /**
     * GET /api/propuestas/{id}
     */
    public function show(PropuestaParticipativa $propuesta): JsonResponse
    {
        return $this->ok(PropuestaResource::make($propuesta->load('organizacion', 'actividad')));
    }

    /**
     * POST /api/propuestas
     */
    public function store(PropuestaRequest $peticion): JsonResponse
    {
        $this->authorize('create', PropuestaParticipativa::class);

        $propuesta = PropuestaParticipativa::create($peticion->validated());

        return $this->guardado(
            PropuestaResource::make($propuesta),
            'Propuesta creada correctamente.',
        );
    }

    /**
     * PATCH /api/propuestas/{id}/estado
     *
     * El procedimiento es la fuente de verdad: si el salto no es valido devuelve
     * P0001 y el 2.12 lo traduce a 422 con el mensaje en espanol.
     */
    public function cambiarEstado(CambiarEstadoPropuestaRequest $peticion, PropuestaParticipativa $propuesta): JsonResponse
    {
        $this->authorize('update', $propuesta);

        // getRawOriginal devuelve el texto tal como esta en la columna; el atributo
        // estado viene casteado al enum y no se puede convertir a string.
        $estadoAnterior = (string) $propuesta->getRawOriginal('estado');
        $estadoNuevo = $peticion->string('estado')->toString();

        DB::transaction(function () use ($peticion, $propuesta, $estadoAnterior, $estadoNuevo): void {
            // PROCEDURE: se invoca con CALL.
            DB::select('CALL sp_cambiar_estado_propuesta(?, ?, ?, ?)', [
                $propuesta->id,
                $estadoNuevo,
                $peticion->input('actividad_id', $propuesta->actividad_id),
                $peticion->input('monto', $propuesta->monto_asignado),
            ]);

            Auditoria::estadoPropuesta($peticion->user(), $estadoAnterior, $estadoNuevo, [
                'propuesta_id' => $propuesta->id,
                'organizacion_id' => $propuesta->organizacion_id,
            ]);
        });

        return $this->ok(
            PropuestaResource::make($propuesta->fresh()->load('organizacion', 'actividad')),
            'Estado de la propuesta actualizado.',
        );
    }
}
