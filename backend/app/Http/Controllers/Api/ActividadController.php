<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ActividadRequest;
use App\Http\Resources\ActividadResource;
use App\Models\Actividad;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/**
 * Tarea 3.7: Actividades (POA) en 6 endpoints.
 *
 * GET /api/actividades/{id}/ejecucion lee de v_ejecucion_actividad. El saldo, el
 * porcentaje y la marca de sobreejecutada no se recalculan en PHP (tarea 4.1).
 */
class ActividadController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/actividades
     */
    public function index(Request $peticion): JsonResponse
    {
        $consulta = $this->filtrar(Actividad::query()->with([
            'gestion', 'unidad', 'partida', 'organizacion',
        ]), $peticion);

        return response()->json($this->listado($consulta, $peticion, ActividadResource::class));
    }

    /**
     * GET /api/actividades/{id}
     */
    public function show(Actividad $actividad): JsonResponse
    {
        return $this->ok(ActividadResource::make($actividad->load([
            'gestion', 'unidad', 'partida', 'organizacion',
        ])));
    }

    /**
     * GET /api/actividades/{id}/ejecucion
     */
    public function ejecucion(Actividad $actividad): JsonResponse
    {
        $fila = DB::selectOne('SELECT * FROM v_ejecucion_actividad WHERE actividad_id = ?', [$actividad->id]);

        if ($fila === null) {
            return $this->ok([
                'actividad_id' => (int) $actividad->id,
                'monto_programado' => (float) $actividad->monto_programado,
                'monto_ejecutado' => 0.0,
                'saldo' => (float) $actividad->monto_programado,
                'porcentaje_ejecucion' => 0.0,
                'sobreejecutada' => false,
            ]);
        }

        return $this->ok([
            'actividad_id' => (int) $fila->actividad_id,
            'gestion_id' => (int) $fila->gestion_id,
            'unidad_id' => (int) $fila->unidad_id,
            'partida_id' => (int) $fila->partida_id,
            'organizacion_id' => $fila->organizacion_id === null ? null : (int) $fila->organizacion_id,
            'objetivo' => $fila->objetivo,
            'meta' => $fila->meta,
            'monto_programado' => (float) $fila->monto_programado,
            'monto_ejecutado' => (float) $fila->monto_ejecutado,
            'saldo' => (float) $fila->saldo,
            'porcentaje_ejecucion' => (float) $fila->porcentaje_ejecucion,
            'sobreejecutada' => (bool) $fila->sobreejecutada,
        ]);
    }

    /**
     * POST /api/actividades
     */
    public function store(ActividadRequest $peticion): JsonResponse
    {
        $this->authorize('create', Actividad::class);

        $actividad = Actividad::create($peticion->validated());

        return $this->guardado(ActividadResource::make($actividad), 'Actividad creada correctamente.');
    }

    /**
     * PUT /api/actividades/{id}
     */
    public function update(ActividadRequest $peticion, Actividad $actividad): JsonResponse
    {
        $this->authorize('update', $actividad);

        $actividad->update($peticion->validated());

        return $this->ok(ActividadResource::make($actividad->fresh()), 'Actividad actualizada correctamente.');
    }

    /**
     * DELETE /api/actividades/{id}
     */
    public function destroy(Actividad $actividad): Response
    {
        $this->authorize('delete', $actividad);

        $actividad->delete();

        return $this->eliminado();
    }

    /**
     * Filtros del listado. Todos son opcionales y se combinan entre si.
     */
    private function filtrar(Builder $consulta, Request $peticion): Builder
    {
        $consulta->orderByDesc('id');

        foreach (['gestion_id', 'unidad_id', 'organizacion_id', 'partida_id'] as $campo) {
            if ($peticion->filled($campo)) {
                $consulta->where($campo, $peticion->integer($campo));
            }
        }

        if ($peticion->filled('q')) {
            $termino = '%'.$peticion->string('q')->toString().'%';
            $consulta->where(function ($q) use ($termino): void {
                $q->where('objetivo', 'ilike', $termino)
                    ->orWhere('meta', 'ilike', $termino)
                    ->orWhere('descripcion', 'ilike', $termino);
            });
        }

        return $consulta;
    }
}
