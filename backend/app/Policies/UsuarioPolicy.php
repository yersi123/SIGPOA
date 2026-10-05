<?php

namespace App\Policies;

use App\Models\Usuario;

/**
 * Gestionar usuarios es exclusive del administrador. Ni el responsable ni el
 * control social pueden crear, modificar ni desactivar cuentas.
 */
class UsuarioPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, Usuario $objetivo): bool
    {
        if ($this->esAdministrador($usuario)) {
            return true;
        }

        return $usuario->is($objetivo);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, Usuario $objetivo): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function delete(Usuario $usuario, Usuario $objetivo): bool
    {
        if (! $this->esAdministrador($usuario)) {
            return false;
        }

        return ! $usuario->is($objetivo);
    }
}
