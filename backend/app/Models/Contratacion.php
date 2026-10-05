<?php

namespace App\Models;

use App\Enums\EstadoContratacion;
use App\Models\Concerns\RestringeUnidad;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contratacion extends Model
{
    use RestringeUnidad;

    protected $table = 'contrataciones';

    protected $fillable = [
        'actividad_id',
        'proveedor_id',
        'descripcion',
        'monto_cotizado',
        'estado',
        'fecha',
        'fecha_cotizacion',
        'fecha_adjudicacion',
    ];

    protected $casts = [
        'actividad_id' => 'integer',
        'proveedor_id' => 'integer',
        'descripcion' => 'string',
        'monto_cotizado' => 'decimal:2',
        'estado' => EstadoContratacion::class,
        'fecha' => 'date',
        'fecha_cotizacion' => 'date',
        'fecha_adjudicacion' => 'date',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class);
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }
}
