<?php

namespace App\Models;

use App\Enums\EstadoGestion;
use Illuminate\Database\Eloquent\Model;

class Gestion extends Model
{
    protected $table = 'gestiones';

    protected $fillable = [
        'anio',
        'estado',
    ];

    protected $casts = [
        'anio' => 'integer',
        'estado' => EstadoGestion::class,
    ];
}
