<?php

namespace App\Http\Controllers\Api;

use App\Exports\EjecucionExport;
use App\Exports\OrganizacionesEjecucionExport;
use App\Models\Gestion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Tarea 3.13: Reportes en 2 endpoints con selector de formato.
 *
 * Ambos admiten ?formato=pdf|excel y son de solo lectura, asi que tambien se
 * permiten a control_social. Los datos salen de v_ejecucion_actividad y de
 * fn_ejecucion_por_organizacion.
 */
class ReporteController extends ApiController
{
    /**
     * GET /api/reportes/ejecucion
     */
    public function ejecucion(Request $peticion): JsonResponse|SymfonyResponse
    {
        $datos = $this->validar($peticion);
        $formato = $datos['formato'];

        if ($formato === 'excel') {
            return Excel::download(new EjecucionExport($datos['gestion_id']), $this->nombre('ejecucion', 'xlsx'));
        }

        return Pdf::loadView('reportes.ejecucion', $this->datosReporte($datos['gestion_id']))
            ->setPaper('a4', 'landscape')
            ->download($this->nombre('ejecucion', 'pdf'));
    }

    /**
     * GET /api/reportes/organizaciones
     */
    public function organizaciones(Request $peticion): JsonResponse|SymfonyResponse
    {
        $datos = $this->validar($peticion);
        $formato = $datos['formato'];

        if ($formato === 'excel') {
            return Excel::download(
                new OrganizacionesEjecucionExport($datos['gestion_id']),
                $this->nombre('organizaciones', 'xlsx'),
            );
        }

        return Pdf::loadView('reportes.organizaciones', $this->datosReporte($datos['gestion_id']))
            ->setPaper('a4', 'landscape')
            ->download($this->nombre('organizaciones', 'pdf'));
    }

    /**
     * Valida el selector de formato y resuelve la gestion.
     *
     * @return array{formato: string, gestion_id: int}
     */
    private function validar(Request $peticion): array
    {
        $validados = $peticion->validate([
            'formato' => ['sometimes', Rule::in(['pdf', 'excel'])],
            'gestion_id' => ['sometimes', 'integer', 'exists:gestiones,id'],
        ]);

        $gestionId = $validados['gestion_id'] ?? Gestion::query()
            ->where('estado', 'abierta')
            ->orderByDesc('anio')
            ->orderByDesc('id')
            ->value('id');

        if ($gestionId === null) {
            $gestionId = Gestion::query()->orderByDesc('anio')->value('id');
        }

        return [
            'formato' => $validados['formato'] ?? 'pdf',
            'gestion_id' => (int) $gestionId,
        ];
    }

    /**
     * Filas que pintan tanto el PDF como el Excel.
     *
     * @return array<string, mixed>
     */
    private function datosReporte(int $gestionId): array
    {
        $resumen = DB::selectOne('SELECT * FROM fn_resumen_dashboard(?)', [$gestionId]);
        $unidades = DB::select('SELECT * FROM fn_ejecucion_por_unidad(?)', [$gestionId]);
        $organizaciones = DB::select('SELECT * FROM fn_ejecucion_por_organizacion(?)', [$gestionId]);
        $alertas = DB::select('SELECT * FROM fn_actividades_sobreejecutadas(?)', [$gestionId]);

        return [
            'gestion' => Gestion::find($gestionId),
            'resumen' => [
                'presupuesto_total' => (float) $resumen->presupuesto_total,
                'total_ejecutado' => (float) $resumen->total_ejecutado,
                'saldo' => (float) $resumen->saldo,
                'porcentaje_ejecucion' => (float) $resumen->porcentaje_ejecucion,
                'actividades_sobreejecutadas' => (int) $resumen->actividades_sobreejecutadas,
            ],
            'unidades' => $unidades,
            'organizaciones' => $organizaciones,
            'alertas' => $alertas,
        ];
    }

    private function nombre(string $base, string $extension): string
    {
        return "{$base}-".now()->format('Ymd-His').".{$extension}";
    }
}
