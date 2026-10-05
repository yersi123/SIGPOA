<?php

namespace App\Models\Observers;

use App\Models\Usuario;

/**
 * Al desactivar un usuario se revocan todos sus tokens (tarea 2.13).
 *
 * Se usa un observer y no solo el endpoint del panel para que la revocacion
 * ocurra sin importar que camino desactive la cuenta, incluido un UPDATE manual.
 */
class UsuarioObserver
{
    public function saved(Usuario $usuario): void
    {
        if (! $usuario->wasChanged('activo')) {
            return;
        }

        if ($usuario->activo) {
            return;
        }

        $usuario->tokens()->delete();
    }
}
