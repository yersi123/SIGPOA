<?php

namespace App\Models;

use App\Enums\EstadoPropuesta;
use App\Models\Concerns\RestringeUnidad;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropuestaParticipativa extends Model
{
    use RestringeUnidad;

    protected $table = 'propuestas_participativas';

    protected $fillable = [
        'organizacion_id',
        'gestion_id',
        'actividad_id',
        'titulo',
        'descripcion',
        'monto_asignado',
        'estado',
    ];

    protected $casts = [
        'organizacion_id' => 'integer',
        'gestion_id' => 'integer',
        'actividad_id' => 'integer',
        'titulo' => 'string',
        'descripcion' => 'string',
        'monto_asignado' => 'decimal:2',
        'estado' => EstadoPropuesta::class,
    ];

    public function organizacion(): BelongsTo
    {
        return $this->belongsTo(Organizacion::class);
    }

    public function gestion(): BelongsTo
    {
        return $this->belongsTo(Gestion::class);
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class);
    }
}
