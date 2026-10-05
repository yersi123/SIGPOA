<?php

namespace App\Policies;

use App\Models\Gestion;
use App\Models\Usuario;

/**
 * El cierre de una gestion lo decide el administrador (R1). El responsable y el
 * control social solo consultan.
 */
class GestionPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Gestion $gestion): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Gestion $gestion): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function cerrar(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Gestion $gestion): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
