<?php

namespace App\Exports;

use App\Models\Actividad;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Tarea 3.13: ejecucion presupuestaria por actividad.
 *
 * Los numeros salen de v_ejecucion_actividad: el Excel no recalcula saldos ni
 * porcentajes, solo los copia de la vista.
 */
class EjecucionExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private readonly int $gestionId) {}

    /**
     * @return Collection<int, object>
     */
    public function collection(): Collection
    {
        return Actividad::query()
            // La vista tambien trae gestion_id, asi que el filtro y el orden se
            // califican con el nombre de la tabla para no ser ambiguos.
            ->join('v_ejecucion_actividad', 'v_ejecucion_actividad.actividad_id', '=', 'actividades.id')
            ->where('actividades.gestion_id', $this->gestionId)
            ->orderBy('actividades.id')
            ->get([
                'actividades.id',
                'actividades.objetivo',
                'actividades.meta',
                'v_ejecucion_actividad.monto_programado',
                'v_ejecucion_actividad.monto_ejecutado',
                'v_ejecucion_actividad.saldo',
                'v_ejecucion_actividad.porcentaje_ejecucion',
                'v_ejecucion_actividad.sobreejecutada',
            ]);
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'ID', 'Objetivo', 'Meta', 'Programado', 'Ejecutado', 'Saldo', '% Ejecucion', 'Sobreejecutada',
        ];
    }

    public function styles(Worksheet $hoja): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Ejecucion presupuestaria';
    }
}
