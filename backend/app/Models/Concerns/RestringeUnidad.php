<?php

namespace App\Models\Concerns;

use App\Models\Scopes\UnidadDelResponsableScope;
use Illuminate\Database\Eloquent\Builder;

/**
 * Aplica al modelo el scope que limita al responsable a su propia unidad.
 *
 * Se usa en los modelos cuyas filas pertenecen a una unidad, ya sea directa
 * (actividad.unidad_id) o a traves de su actividad (gastos, contrataciones,
 * propuestas participativas).
 */
trait RestringeUnidad
{
    public static function bootRestringeUnidad(): void
    {
        static::addGlobalScope(new UnidadDelResponsableScope);
    }

    /**
     * Deja el modelo sin la restriccion de unidad.
     *
     * Solo para tareas administrativas legitimas del backend, como migraciones
     * o las funciones de dashboard agregadas por la base. Los endpoints nunca
     * deben llamar a este metodo con datos controlados por el usuario.
     */
    public function scopeSinRestriccionUnidad(Builder $query): Builder
    {
        return $query->withoutGlobalScope(UnidadDelResponsableScope::class);
    }
}
