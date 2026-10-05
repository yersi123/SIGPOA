<?php

namespace App\Policies;

use App\Models\Entidad;
use App\Models\Usuario;

class EntidadPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Entidad $entidad): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Entidad $entidad): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Entidad $entidad): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
