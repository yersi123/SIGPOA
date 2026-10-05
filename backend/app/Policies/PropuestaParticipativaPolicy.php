<?php

namespace App\Policies;

use App\Models\PropuestaParticipativa;
use App\Models\Usuario;

class PropuestaParticipativaPolicy extends PolicyBase
{
    public function viewAny(Usuario $usuario): bool
    {
        return $this->puedeVer($usuario);
    }

    public function view(Usuario $usuario, PropuestaParticipativa $propuesta): bool
    {
        return $this->puedeVer($usuario);
    }

    public function create(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    /**
     * El cambio de estado lo aplica sp_cambiar_estado_propuesta (R5) y el monto lo
     * valida el trigger trg_propuestas_monto (R9).
     */
    public function cambiarEstado(Usuario $usuario): bool
    {
        return $this->puedeCrear($usuario);
    }

    public function update(Usuario $usuario, PropuestaParticipativa $propuesta): bool
    {
        return $this->puedeActualizar($usuario, $propuesta);
    }

    public function delete(Usuario $usuario, PropuestaParticipativa $propuesta): bool
    {
        return $this->puedeEliminar($usuario);
    }
}
