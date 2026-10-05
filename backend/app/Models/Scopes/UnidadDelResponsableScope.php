<?php

namespace App\Models\Scopes;

use App\Models\Unidad;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Impide que el responsable vea datos de otras unidades (regla R8, tarea 2.9).
 *
 * La restriccion se aplica en el modelo y no en el controlador, para que ningun
 * endpoint pueda olvidarla. Un ?unidad_id=ajeno no amplia el resultado: como
 * maximo lo reduce, porque el where se encadena con AND sobre el filtro que
 * aplica el usuario.
 *
 * No hace nada si no hay usuario autenticado, o si el usuario no es responsable,
 * de modo que el login, la consola y los scripts siguen funcionando.
 */
class UnidadDelResponsableScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $usuario = auth()->user();

        if (! $usuario instanceof Usuario || ! $usuario->esResponsable()) {
            return;
        }

        $unidadId = $usuario->unidad_id;

        if ($unidadId === null) {
            $builder->whereRaw('1 = 0');

            return;
        }

        $this->restringir($builder, $model, $unidadId);
    }

    private function restringir(Builder $builder, Model $model, int $unidadId): void
    {
        if ($model instanceof Unidad) {
            $builder->where($model->getTable().'.id', $unidadId);

            return;
        }

        if ($this->tieneColumna($model, 'unidad_id')) {
            $builder->where($model->getTable().'.unidad_id', $unidadId);

            return;
        }

        if ($this->tieneColumna($model, 'actividad_id')) {
            $builder->whereHas(
                'actividad',
                fn (Builder $q) => $q->where('unidad_id', $unidadId)
            );
        }
    }

    /**
     * Se consulta sobre los atributos declarados en el modelo y no sobre el
     * esquema, para no agregar una consulta a information_schema en cada consulta.
     */
    private function tieneColumna(Model $model, string $columna): bool
    {
        return array_key_exists($columna, $model->getCasts())
            || in_array($columna, $model->getFillable(), true);
    }
}
