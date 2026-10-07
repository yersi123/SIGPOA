<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de entidad.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class EntidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        // El 403 por rol lo resuelve la policy del modelo dentro del controlador.
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:150',
                Rule::unique('entidades', 'nombre')->ignore($this->route('entidad')),
            ],
            'tipo' => ['required', 'string', 'in:gobernacion,municipio,ministerio,unidad_educativa,otro'],
            'departamento' => ['required', 'string', 'max:50'],
            'municipio' => ['nullable', 'string', 'max:80'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.regex' => 'El codigo debe tener 5 o 6 digitos, segun el CHECK ck_partidas_codigo.',
            'nombre.unique' => 'Ya existe una entidad con ese nombre.',
        ];
    }
}
