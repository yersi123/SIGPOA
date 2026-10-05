<?php

namespace App\Http\Requests;

use App\Enums\EstadoContratacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de contratacion.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class ContratacionRequest extends FormRequest
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
            'actividad_id' => ['required', 'integer', 'exists:actividades,id'],
            'proveedor_id' => ['required', 'integer', 'exists:proveedores,id'],
            'descripcion' => ['required', 'string', 'max:250'],
            'monto_cotizado' => ['required', 'numeric', 'min:0'],
            'estado' => ['required', Rule::enum(EstadoContratacion::class)],
            'fecha' => ['required', 'date'],
            'fecha_cotizacion' => ['nullable', 'date', 'after_or_equal:fecha'],
            'fecha_adjudicacion' => ['nullable', 'date', 'after_or_equal:fecha_cotizacion'],
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
