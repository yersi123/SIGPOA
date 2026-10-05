<?php

namespace App\Models;

use App\Models\Concerns\RestringeUnidad;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Actividad extends Model
{
    use RestringeUnidad;

    protected $table = 'actividades';

    protected $fillable = [
        'gestion_id',
        'unidad_id',
        'partida_id',
        'organizacion_id',
        'objetivo',
        'meta',
        'descripcion',
        'monto_programado',
    ];

    protected $casts = [
        'gestion_id' => 'integer',
        'unidad_id' => 'integer',
        'partida_id' => 'integer',
        'organizacion_id' => 'integer',
        'objetivo' => 'string',
        'meta' => 'string',
        'descripcion' => 'string',
        'monto_programado' => 'decimal:2',
    ];

    public function gestion(): BelongsTo
    {
        return $this->belongsTo(Gestion::class);
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }

    public function partida(): BelongsTo
    {
        return $this->belongsTo(Partida::class);
    }

    public function organizacion(): BelongsTo
    {
        return $this->belongsTo(Organizacion::class);
    }
}
