<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de proveedor.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class ProveedorRequest extends FormRequest
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
            'nombre' => ['required', 'string', 'max:150'],
            'nit' => ['nullable', 'string', 'max:20'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:200'],
        ];
    }
}
