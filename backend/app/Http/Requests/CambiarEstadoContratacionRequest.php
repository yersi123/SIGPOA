<?php

namespace App\Http\Requests;

use App\Enums\EstadoContratacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea 3.10: validar el cambio de estado de una contratacion.
 */
class CambiarEstadoContratacionRequest extends FormRequest
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
            'estado' => ['required', Rule::enum(EstadoContratacion::class)],
        ];
    }
}
