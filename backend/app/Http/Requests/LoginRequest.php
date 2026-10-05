<?php

namespace App\Http\Requests;

use App\Enums\EstadoPropuesta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:filter', 'max:120'],
            'password' => ['required', 'string', 'max:120'],
            'device_name' => ['required', 'string', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge(['email' => mb_strtolower(trim((string) $this->input('email')))]);
        }
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'El correo no tiene un formato valido.',
            'email.max' => 'El correo no puede superar los 120 caracteres.',
            'password.required' => 'La contrasena es obligatoria.',
            'password.max' => 'La contrasena no puede superar los 120 caracteres.',
            'device_name.required' => 'El nombre del dispositivo es obligatorio.',
            'device_name.max' => 'El nombre del dispositivo no puede superar los 100 caracteres.',
        ];
    }

    /**
     * Los estados validos se validan contra el enum, no contra una lista escrita a mano.
     *
     * @return array<string, mixed>
     */
    public static function reglasEstado(string $campo, EstadoPropuesta $enum): array
    {
        return [$campo, ['required', Rule::enum($enum)]];
    }
}
