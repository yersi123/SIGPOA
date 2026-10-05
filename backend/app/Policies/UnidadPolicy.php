<?php

namespace App\Policies;

use App\Models\Unidad;
use App\Models\Usuario;

class UnidadPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Unidad $unidad): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Unidad $unidad): bool
    {
        return $this->puedeActualizar($usuario, $unidad);
    }

    public function delete(Usuario $usuario, Unidad $unidad): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
