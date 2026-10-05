<?php

namespace App\Policies;

use App\Models\Actividad;
use App\Models\Scopes\UnidadDelResponsableScope;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;

/**
 * Regla R8 de autorizacion por rol.
 *
 * - administrador: acceso total.
 * - responsable: opera solo dentro de su unidad y no gestiona usuarios.
 * - control_social: solo lectura, en todo el sistema.
 */
abstract class PolicyBase
{
    protected function esAdministrador(?Usuario $usuario): bool
    {
        return $usuario instanceof Usuario && $usuario->esAdministrador();
    }

    /**
     * El control social puede leer cualquier registro.
     */
    protected function puedeVer(Usuario $usuario): bool
    {
        return true;
    }

    /**
     * Solo el administrador escribe.
     */
    protected function puedeCrear(Usuario $usuario): bool
    {
        return $usuario->esAdministrador();
    }

    /**
     * El administrador actualiza cualquier registro. El responsable actualiza
     * solo los que pertenecen a su unidad.
     */
    protected function puedeActualizar(Usuario $usuario, Model $modelo): bool
    {
        if ($usuario->esAdministrador()) {
            return true;
        }

        if (! $usuario->esResponsable()) {
            return false;
        }

        return $this->perteneceAUnidadDelResponsable($usuario, $modelo);
    }

    protected function puedeEliminar(Usuario $usuario): bool
    {
        return $usuario->esAdministrador();
    }

    /**
     * Determina si el registro pertenece a la unidad del responsable.
     *
     * La unidad se deduce de la relacion del modelo y nunca del parametro de la
     * peticion, que es justamente lo que no se debe usar.
     */
    protected function perteneceAUnidadDelResponsable(Usuario $usuario, Model $modelo): bool
    {
        $unidadId = $usuario->unidad_id;

        if ($unidadId === null) {
            return false;
        }

        $unidadDelRegistro = $modelo->getAttribute('unidad_id');

        if ($unidadDelRegistro !== null) {
            return (int) $unidadDelRegistro === $unidadId;
        }

        $actividadId = $modelo->getAttribute('actividad_id');

        if ($actividadId === null) {
            return false;
        }

        return Actividad::query()
            ->withoutGlobalScope(UnidadDelResponsableScope::class)
            ->whereKey($actividadId)
            ->where('unidad_id', $unidadId)
            ->exists();
    }
}
