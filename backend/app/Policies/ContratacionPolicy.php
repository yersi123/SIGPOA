<?php

namespace App\Policies;

use App\Models\Contratacion;
use App\Models\Usuario;

class ContratacionPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Contratacion $contratacion): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    /**
     * La adjudicacion la aplica sp_adjudicar_contratacion, que solo admite el
     * estado de cotizacion (R7). El permiso lo decide el administrador.
     */
    public function adjudicar(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Contratacion $contratacion): bool
    {
        return $this->puedeActualizar($usuario, $contratacion);
    }

    public function delete(Usuario $usuario, Contratacion $contratacion): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
