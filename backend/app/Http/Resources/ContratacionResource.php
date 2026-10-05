<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContratacionResource extends JsonResource
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
            'descripcion' => $this->descripcion,
            'monto_cotizado' => $this->monto_cotizado,
            'estado' => $this->estado,
            'fecha' => $this->fecha,
            'fecha_cotizacion' => $this->fecha_cotizacion,
            'fecha_adjudicacion' => $this->fecha_adjudicacion,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
