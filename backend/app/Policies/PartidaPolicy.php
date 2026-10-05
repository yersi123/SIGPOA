<?php

namespace App\Policies;

use App\Models\Partida;
use App\Models\Usuario;

class PartidaPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Partida $partida): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Partida $partida): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Partida $partida): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
