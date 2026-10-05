<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    protected $table = 'proveedores';

    protected $fillable = [
        'nombre',
        'nit',
        'telefono',
        'direccion',
    ];

    protected $casts = [
        'nombre' => 'string',
        'nit' => 'string',
        'telefono' => 'string',
        'direccion' => 'string',
    ];
}
