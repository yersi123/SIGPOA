<?php

namespace App\Http\Requests;

use App\Enums\EstadoPropuesta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea 3.12: validar el cambio de estado de una propuesta.
 *
 * Los saltos y retrocesos no se comprueban aqui: los rechaza
 * sp_cambiar_estado_propuesta y el trigger trg_propuestas_estado, que es la
 * fuente de verdad de la regla R5.
 */
class CambiarEstadoPropuestaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'estado' => ['required', Rule::enum(EstadoPropuesta::class)],
            'actividad_id' => ['nullable', 'integer', 'exists:actividades,id'],
            'monto' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
