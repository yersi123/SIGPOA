<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Tarea 3.13: ejecucion por organizacion.
 *
 * Los numeros salen de fn_ejecucion_por_organizacion, que ya agrupa por
 * organizacion. El Excel no recalcula nada.
 */
class OrganizacionesEjecucionExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private readonly int $gestionId) {}

    /**
     * @return Collection<int, object>
     */
    public function collection(): Collection
    {
        $filas = DB::select('SELECT * FROM fn_ejecucion_por_organizacion(?)', [$this->gestionId]);

        return collect($filas)->map(fn ($f) => (object) [
            'organizacion' => $f->organizacion,
            'tipo' => $f->tipo,
            'monto_programado' => $f->monto_programado,
            'monto_ejecutado' => $f->monto_ejecutado,
            'porcentaje_ejecucion' => $f->porcentaje_ejecucion,
        ]);
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['Organizacion', 'Tipo', 'Programado', 'Ejecutado', '% Ejecucion'];
    }

    public function styles(Worksheet $hoja): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Ejecucion por organizacion';
    }
}
