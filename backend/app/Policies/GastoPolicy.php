<?php

namespace App\Policies;

use App\Models\Gasto;
use App\Models\Usuario;

class GastoPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Gasto $gasto): bool
    {
        return $this->puedeVer($usuario);
    }

    /**
     * Registrar un gasto lo hace el procedimiento almacenado, que ya valida que
     * la gestion este abierta (R4). El permiso lo decide el administrador.
     */
    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Gasto $gasto): bool
    {
        return $this->puedeActualizar($usuario, $gasto);
    }

    public function delete(Usuario $usuario, Gasto $gasto): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
