<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Entidad extends Model
{
    protected $table = 'entidades';

    protected $fillable = [
        'nombre',
        'tipo',
        'departamento',
        'municipio',
    ];

    protected $casts = [
        'nombre' => 'string',
        'tipo' => 'string',
        'departamento' => 'string',
        'municipio' => 'string',
    ];

    /**
     * Unidades de la entidad. La tarea 3.4 pide las entidades con sus unidades
     * anidadas, que es el unico caso del proyecto que necesita una hasMany.
     */
    public function unidades(): HasMany
    {
        return $this->hasMany(Unidad::class, 'entidad_id');
    }
}
