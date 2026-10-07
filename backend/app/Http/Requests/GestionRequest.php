<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validar el alta de una gestion.
 *
 * Los limites replican los de la tabla: uq_gestiones_anio (unico) y
 * ck_gestiones_anio (2000-2100). El estado no se recibe: toda gestion nueva nace
 * cerrada y se abre despues con POST /gestiones/{id}/abrir.
 */
class GestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // El 403 por rol lo resuelve el authorize del controlador contra el Gate.
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'anio' => [
                'required',
                'integer',
                'between:2000,2100',
                Rule::unique('gestiones', 'anio'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'anio.required' => 'El año de la gestión es obligatorio.',
            'anio.integer' => 'El año debe ser un número entero.',
            'anio.between' => 'El año debe estar entre 2000 y 2100.',
            'anio.unique' => 'Ya existe una gestión para ese año.',
        ];
    }
}