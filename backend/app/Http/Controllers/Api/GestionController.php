<?php

namespace App\Http\Controllers\Api;

use App\Enums\EstadoGestion;
use App\Http\Requests\CerrarGestionRequest;
use App\Http\Requests\GestionRequest;
use App\Http\Resources\GestionResource;
use App\Models\Gestion;
use App\Support\Auditoria;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Tarea 3.3: Gestiones.
 *
 * Listado, detalle, alta y cierre. Una gestion nueva nace cerrada: para dejarla
 * en abierta se usa POST /gestiones/{id}/abrir, que respeta la regla R1 de que
 * solo puede haber una gestion abierta a la vez. El cierre va por
 * sp_cerrar_gestion para que las reglas de negocio las decida la base de datos.
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
     * POST /api/gestiones
     *
     * El alta nace cerrada a proposito: asi la gestion abierta anterior sigue
     * activa hasta que el administrador la cierre y active esta.
     */
    public function store(GestionRequest $peticion): JsonResponse
    {
        $this->authorize('create', Gestion::class);

        $gestion = Gestion::create([
            'anio' => $peticion->integer('anio'),
            'estado' => EstadoGestion::Cerrada,
        ]);

        return $this->guardado(
            GestionResource::make($gestion),
            'Gestion creada. Activala para registrar actividades y gastos.',
        );
    }

    /**
     * POST /api/gestiones/{id}/abrir
     *
     * Solo puede haber una gestion abierta a la vez. Si ya hay otra abierta se
     * devuelve 422 para que el administrador la cierre primero. La comprobacion
     * va dentro de una transaccion con lock para que dos activaciones
     * simultaneas no dejen dos gestiones abiertas.
     */
    public function abrir(Gestion $gestion): JsonResponse
    {
        $this->authorize('abrir-gestion', $gestion);

        DB::transaction(function () use ($gestion): void {
            if ($gestion->estado === EstadoGestion::Abierta) {
                throw ValidationException::withMessages([
                    'estado' => ['La gestión ya está abierta.'],
                ]);
            }

            $abierta = Gestion::query()
                ->where('estado', EstadoGestion::Abierta->value)
                ->whereKeyNot($gestion->id)
                ->lockForUpdate()
                ->first();

            if ($abierta !== null) {
                throw ValidationException::withMessages([
                    'estado' => [
                        "Ya existe una gestión abierta ({$abierta->anio}). Ciérrala antes de activar otra.",
                    ],
                ]);
            }

            $gestion->estado = EstadoGestion::Abierta;
            $gestion->save();
        });

        return $this->ok(
            GestionResource::make($gestion->fresh()),
            'Gestion abierta correctamente.',
        );
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
