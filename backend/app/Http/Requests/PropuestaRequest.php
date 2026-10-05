<?php

namespace App\Http\Requests;

use App\Enums\EstadoPropuesta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de propuesta participativa.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class PropuestaRequest extends FormRequest
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
            'organizacion_id' => ['required', 'integer', 'exists:organizaciones,id'],
            'gestion_id' => ['required', 'integer', 'exists:gestiones,id'],
            'actividad_id' => ['nullable', 'integer', 'exists:actividades,id'],
            'titulo' => ['required', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string'],
            'monto_asignado' => ['required', 'numeric', 'min:0'],
            'estado' => ['nullable', Rule::enum(EstadoPropuesta::class)],
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
