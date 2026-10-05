<?php

namespace App\Http\Requests;

use App\Enums\TipoOrganizacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Tarea de la seccion 3: validar el alta y la modificacion de organizacion.
 *
 * Los limites coinciden con los varchar de la tabla, para que un texto demasiado
 * largo se rechace con 422 en el backend y no con el error 22001 de PostgreSQL.
 */
class OrganizacionRequest extends FormRequest
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
            'tipo' => ['required', Rule::enum(TipoOrganizacion::class)],
            'personeria_juridica' => ['nullable', 'string', 'max:50'],
            'representante' => ['nullable', 'string', 'max:120'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:200'],
        ];
    }

    /**
     * Normaliza el tipo antes de validar.
     *
     * El CHECK ck_organizaciones_tipo guarda OTB en mayusculas y los otros tres
     * en minusculas. La tarea 3.11 documenta ?tipo=otb en minusculas, asi que se
     * acepta cualquiera de las dos formas y se guarda el valor canonico del enum.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('tipo')) {
            return;
        }

        $tipo = TipoOrganizacion::fromLabel((string) $this->input('tipo'));

        $this->merge(['tipo' => $tipo?->value]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de organizacion es obligatorio.',
            'tipo.enum' => 'El tipo debe ser OTB, sindicato, junta_vecinal o pueblo_indigena.',
            'personeria_juridica.max' => 'La personeria juridica no puede superar 50 caracteres.',
            'nombre.max' => 'El nombre no puede superar 150 caracteres.',
            'representante.max' => 'El representante no puede superar 120 caracteres.',
        ];
    }
}
