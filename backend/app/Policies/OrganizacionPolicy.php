<?php

namespace App\Policies;

use App\Models\Organizacion;
use App\Models\Usuario;

class OrganizacionPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Organizacion $organizacion): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Organizacion $organizacion): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Organizacion $organizacion): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
