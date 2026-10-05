<?php

namespace App\Policies;

use App\Models\Proveedor;
use App\Models\Usuario;

class ProveedorPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Proveedor $proveedor): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Proveedor $proveedor): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Proveedor $proveedor): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
