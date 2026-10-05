<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\Usuario;

class RolePolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Role $role): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Role $role): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Role $role): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
