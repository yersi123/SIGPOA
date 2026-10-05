<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropuestaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actividad_id' => $this->actividad_id,
            'organizacion_id' => $this->organizacion_id,
            'gestion_id' => $this->gestion_id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'monto_asignado' => $this->monto_asignado,
            'estado' => $this->estado,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
