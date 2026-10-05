<?php

namespace App\Models;

use App\Models\Concerns\RestringeUnidad;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gasto extends Model
{
    use RestringeUnidad;

    protected $table = 'gastos';

    protected $fillable = [
        'actividad_id',
        'proveedor_id',
        'fecha',
        'monto',
        'detalle',
        'registrado_por',
    ];

    protected $casts = [
        'actividad_id' => 'integer',
        'proveedor_id' => 'integer',
        'registrado_por' => 'integer',
        'fecha' => 'date',
        'monto' => 'decimal:2',
        'detalle' => 'string',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class);
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'registrado_por');
    }
}
