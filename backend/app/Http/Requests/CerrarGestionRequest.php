<?php

namespace App\Http\Requests;

use App\Enums\EstadoGestion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea 3.3: validar el cierre de una gestion.
 *
 * El cierre no se hace con un UPDATE normal sino con sp_cerrar_gestion, que es
 * quien comprueba las reglas de negocio. Aqui solo se valida la forma del
 * pedido.
 */
class CerrarGestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Solo el administrador puede cerrar una gestion (tarea 3.3). Este authorize
        // devuelve 403 antes de validar; la policy cerrar-gestion vuelve a
        // comprobarlo sobre el modelo concreto dentro del controlador.
        return $this->user()?->esAdministrador() === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'anio' => ['sometimes', 'integer', 'between:2000,2100'],
            'estado' => ['sometimes', Rule::enum(EstadoGestion::class)],
        ];
    }
}
