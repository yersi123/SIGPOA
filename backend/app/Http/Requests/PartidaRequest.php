<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de partida presupuestaria.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class PartidaRequest extends FormRequest
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
            'codigo' => ['required', 'string', 'max:10', 'regex:/^\d{5,6}$/'],
            'nombre' => ['required', 'string', 'max:120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.regex' => 'El codigo debe tener 5 o 6 digitos, segun el CHECK ck_partidas_codigo.',
        ];
    }
}
