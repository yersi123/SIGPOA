<?php

namespace App\Http\Controllers\Api;

use App\Enums\EstadoGestion;
use App\Models\Gestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Tarea 3.2: Dashboard en 4 endpoints de solo lectura.
 *
 * Todos los numeros salen de las funciones de la base de datos
 * (fn_resumen_dashboard, fn_ejecucion_por_unidad, fn_ejecucion_por_organizacion y
 * fn_actividades_sobreejecutadas). El backend no recalcula saldos ni
 * porcentajes en PHP.
 */
class DashboardController extends ApiController
{
    /**
     * GET /api/dashboard/resumen
     */
    public function resumen(Request $peticion): JsonResponse
    {
        $gestionId = $this->gestionId($peticion);

        $fila = DB::selectOne('SELECT * FROM fn_resumen_dashboard(?)', [$gestionId]);

        return $this->ok([
            'gestion_id' => $gestionId,
            'presupuesto_total' => (float) $fila->presupuesto_total,
            'total_ejecutado' => (float) $fila->total_ejecutado,
            'saldo' => (float) $fila->saldo,
            'porcentaje_ejecucion' => (float) $fila->porcentaje_ejecucion,
            'actividades_sobreejecutadas' => (int) $fila->actividades_sobreejecutadas,
        ]);
    }

    /**
     * GET /api/dashboard/por-unidad
     */
    public function porUnidad(Request $peticion): JsonResponse
    {
        $gestionId = $this->gestionId($peticion);

        $filas = DB::select(
            'SELECT * FROM fn_ejecucion_por_unidad(?)',
            [$gestionId],
        );

        return $this->ok(array_map(fn ($f) => [
            'unidad' => $f->unidad,
            'monto_programado' => (float) $f->monto_programado,
            'monto_ejecutado' => (float) $f->monto_ejecutado,
            'saldo' => (float) $f->saldo,
            'porcentaje_ejecucion' => (float) $f->porcentaje_ejecucion,
        ], $filas));
    }

    /**
     * GET /api/dashboard/por-organizacion
     */
    public function porOrganizacion(Request $peticion): JsonResponse
    {
        $gestionId = $this->gestionId($peticion);

        $filas = DB::select(
            'SELECT * FROM fn_ejecucion_por_organizacion(?)',
            [$gestionId],
        );

        return $this->ok(array_map(fn ($f) => [
            'organizacion' => $f->organizacion,
            'tipo' => $f->tipo,
            'monto_programado' => (float) $f->monto_programado,
            'monto_ejecutado' => (float) $f->monto_ejecutado,
            'porcentaje_ejecucion' => (float) $f->porcentaje_ejecucion,
        ], $filas));
    }

    /**
     * GET /api/dashboard/alertas
     */
    public function alertas(Request $peticion): JsonResponse
    {
        $gestionId = $this->gestionId($peticion);

        $filas = DB::select(
            'SELECT * FROM fn_actividades_sobreejecutadas(?)',
            [$gestionId],
        );

        return $this->ok(array_map(fn ($f) => [
            'actividad_id' => (int) $f->actividad_id,
            'objetivo' => $f->objetivo,
            'monto_programado' => (float) $f->monto_programado,
            'monto_ejecutado' => (float) $f->monto_ejecutado,
            'exceso' => (float) $f->exceso,
        ], $filas));
    }

    /**
     * Resuelve la gestion consultada.
     *
     * Si no se envia gestion_id se usa la gestion abierta mas reciente, que es la
     * que se esta ejecutando. La gestion nunca se deduce de un dato del
     * usuario: sale de la propia tabla de gestiones.
     */
    private function gestionId(Request $peticion): int
    {
        if ($peticion->filled('gestion_id')) {
            $id = (int) $peticion->integer('gestion_id');

            if (! Gestion::whereKey($id)->exists()) {
                throw ValidationException::withMessages([
                    'gestion_id' => 'La gestion indicada no existe.',
                ]);
            }

            return $id;
        }

        $abierta = Gestion::query()
            ->where('estado', EstadoGestion::Abierta)
            ->orderByDesc('anio')
            ->orderByDesc('id')
            ->first();

        if ($abierta === null) {
            throw ValidationException::withMessages([
                'gestion_id' => 'No hay ninguna gestion abierta. Indica el gestion_id.',
            ]);
        }

        return (int) $abierta->id;
    }
}
