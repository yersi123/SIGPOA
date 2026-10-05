<?php

namespace App\Policies;

use App\Models\Actividad;
use App\Models\Usuario;

class ActividadPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Actividad $actividad): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Actividad $actividad): bool
    {
        return $this->puedeActualizar($usuario, $actividad);
    }

    public function delete(Usuario $usuario, Actividad $actividad): bool
    {
        return $this->puedeEliminar($usuario);
    }

    public function restore(Usuario $usuario, Actividad $actividad): bool
    {
        return $this->puedeEliminar($usuario);
    }

    public function forceDelete(Usuario $usuario, Actividad $actividad): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
