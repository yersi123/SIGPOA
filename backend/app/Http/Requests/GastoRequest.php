<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Tarea 3.8: validar el registro de un gasto.
 *
 * El gasto no se inserta con un INSERT: lo registra sp_registrar_gasto, que
 * comprueba la regla R4 (gastos solo en gestiones abiertas). Aqui solo se valida
 * la forma del pedido; el 422 con el texto de la base lo produce el 2.12.
 */
class GastoRequest extends FormRequest
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
            'actividad_id' => ['required', 'integer', 'exists:actividades,id'],
            'proveedor_id' => ['nullable', 'integer', 'exists:proveedores,id'],
            'fecha' => ['required', 'date'],
            'monto' => ['required', 'numeric', 'gt:0'],
            'detalle' => ['nullable', 'string', 'max:250'],
        ];
    }
}
