<?php

namespace App\Models;

use App\Enums\TipoOrganizacion;
use Illuminate\Database\Eloquent\Model;

class Organizacion extends Model
{
    protected $table = 'organizaciones';

    protected $fillable = [
        'nombre',
        'tipo',
        'personeria_juridica',
        'representante',
        'telefono',
        'direccion',
    ];

    protected $casts = [
        'nombre' => 'string',
        'tipo' => TipoOrganizacion::class,
        'personeria_juridica' => 'string',
        'representante' => 'string',
        'telefono' => 'string',
        'direccion' => 'string',
    ];
}
