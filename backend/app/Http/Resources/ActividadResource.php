<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActividadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gestion_id' => $this->gestion_id,
            'unidad_id' => $this->unidad_id,
            'partida_id' => $this->partida_id,
            'organizacion_id' => $this->organizacion_id,
            'objetivo' => $this->objetivo,
            'meta' => $this->meta,
            'descripcion' => $this->descripcion,
            'monto_programado' => $this->monto_programado,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
