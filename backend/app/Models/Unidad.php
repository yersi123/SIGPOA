<?php

namespace App\Models;

use App\Models\Concerns\RestringeUnidad;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unidad extends Model
{
    use RestringeUnidad;

    protected $table = 'unidades';

    protected $fillable = [
        'entidad_id',
        'nombre',
        'responsable',
    ];

    protected $casts = [
        'entidad_id' => 'integer',
        'nombre' => 'string',
        'responsable' => 'string',
    ];

    /**
     * Entidad a la que pertenece la unidad. La necesita el filtro ?entidad_id= de
     * la tarea 3.5 y el listado anidado de la tarea 3.4.
     */
    public function entidad(): BelongsTo
    {
        return $this->belongsTo(Entidad::class, 'entidad_id');
    }
}
