<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de actividad del POA.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class ActividadRequest extends FormRequest
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
            'gestion_id' => ['required', 'integer', 'exists:gestiones,id'],
            'unidad_id' => ['required', 'integer', 'exists:unidades,id'],
            'partida_id' => ['required', 'integer', 'exists:partidas,id'],
            'organizacion_id' => ['nullable', 'integer', 'exists:organizaciones,id'],
            'objetivo' => ['required', 'string', 'max:200'],
            'meta' => ['nullable', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string'],
            'monto_programado' => ['required', 'numeric', 'min:0'],
        ];
    }
}
