<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GastoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actividad_id' => $this->actividad_id,
            'proveedor_id' => $this->proveedor_id,
            'fecha' => $this->fecha,
            'monto' => $this->monto,
            'detalle' => $this->detalle,
            'registrado_por' => $this->registrado_por,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
