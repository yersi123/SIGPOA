<?php

namespace App\Http\Controllers\Api;

use App\Enums\EstadoContratacion;
use App\Http\Requests\CambiarEstadoContratacionRequest;
use App\Http\Requests\ContratacionRequest;
use App\Http\Resources\ContratacionResource;
use App\Models\Contratacion;
use App\Support\Auditoria;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Tarea 3.10: Contrataciones en 5 endpoints.
 *
 * El cambio de estado y la adjudicacion van por la base: PATCH estado usa el
 * trigger trg_contrataciones_estado y la adjudicacion usa
 * sp_adjudicar_contratacion, que aplica la regla R7.
 */
class ContratacionController extends ApiController
{
    use AuthorizesRequests;

    /**
     * GET /api/contrataciones
     */
    public function index(Request $peticion): JsonResponse
    {
        $peticion->validate([
            'estado' => ['sometimes', Rule::enum(EstadoContratacion::class)],
            'actividad_id' => ['sometimes', 'integer'],
            'proveedor_id' => ['sometimes', 'integer'],
        ]);

        $consulta = Contratacion::query()->with('actividad', 'proveedor')->orderByDesc('id');

        foreach (['actividad_id', 'proveedor_id'] as $campo) {
            if ($peticion->filled($campo)) {
                $consulta->where($campo, $peticion->integer($campo));
            }
        }

        if ($peticion->filled('estado')) {
            $consulta->where('estado', $peticion->string('estado')->toString());
        }

        return response()->json($this->listado($consulta, $peticion, ContratacionResource::class));
    }

    /**
     * GET /api/contrataciones/{id}
     */
    public function show(Contratacion $contratacion): JsonResponse
    {
        return $this->ok(ContratacionResource::make($contratacion->load('actividad', 'proveedor')));
    }

    /**
     * POST /api/contrataciones
     */
    public function store(ContratacionRequest $peticion): JsonResponse
    {
        $this->authorize('create', Contratacion::class);

        $contratacion = Contratacion::create($peticion->validated());

        return $this->guardado(
            ContratacionResource::make($contratacion),
            'Contratacion creada correctamente.',
        );
    }

    /**
     * PATCH /api/contrataciones/{id}/estado
     *
     * El paso de solicitud a cotizacion se deja en manos del trigger, que
     * rechaza los saltos y retrocesos con P0001 y un mensaje en espanol.
     */
    public function cambiarEstado(CambiarEstadoContratacionRequest $peticion, Contratacion $contratacion): JsonResponse
    {
        $this->authorize('update', $contratacion);

        // getRawOriginal devuelve el texto tal como esta en la columna; el atributo
        // estado viene casteado al enum y no se puede convertir a string.
        $anterior = (string) $contratacion->getRawOriginal('estado');
        $nuevo = $peticion->string('estado')->toString();

        DB::transaction(function () use ($peticion, $contratacion, $anterior, $nuevo): void {
            $contratacion->update(['estado' => $nuevo]);

            Auditoria::estadoContratacion(
                $peticion->user(),
                $contratacion,
                $anterior,
                $nuevo,
            );
        });

        return $this->ok(
            ContratacionResource::make($contratacion->fresh()),
            'Estado de la contratacion actualizado.',
        );
    }

    /**
     * POST /api/contrataciones/{id}/adjudicar
     */
    public function adjudicar(Request $peticion, Contratacion $contratacion): JsonResponse
    {
        $this->authorize('update', $contratacion);

        DB::transaction(function () use ($peticion, $contratacion): void {
            // PROCEDURE: se invoca con CALL.
            DB::select('CALL sp_adjudicar_contratacion(?)', [$contratacion->id]);

            Auditoria::adjudicacion($peticion->user(), [
                'contratacion_id' => $contratacion->id,
                'actividad_id' => $contratacion->actividad_id,
            ]);
        });

        return $this->ok(
            ContratacionResource::make($contratacion->fresh()->load('actividad', 'proveedor')),
            'Contratacion adjudicada correctamente.',
        );
    }
}
