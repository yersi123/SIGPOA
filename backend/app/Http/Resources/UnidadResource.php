<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnidadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'entidad_id' => $this->entidad_id,
            'nombre' => $this->nombre,
            'responsable' => $this->responsable,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
