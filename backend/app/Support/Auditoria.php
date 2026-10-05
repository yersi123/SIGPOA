<?php

namespace App\Support;

use App\Models\Contratacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Log;

/**
 * Bitacora de auditoria.
 *
 * La base de datos no tiene tabla de auditoria, asi que los eventos
 * relevantes se registran en el canal de log de Laravel. Nunca se escribe
 * una contrasena ni un token en el log.
 */
class Auditoria
{
    public const LOGIN_FALLIDO = 'login_fallido';

    public const LOGIN_EXITOSO = 'login_exitoso';

    public const LOGOUT = 'logout';

    public const ESTADO_PROPUESTA = 'estado_propuesta';

    public const ADJUDICACION = 'adjudicacion';

    public const CIERRE_GESTION = 'cierre_gestion';

    public const ESTADO_CONTRATACION = 'estado_contratacion';

    /**
     * @param  array<string, mixed>  $contexto
     */
    public static function registrar(string $evento, array $contexto = []): void
    {
        Log::channel('stack')->info('auditoria', array_merge([
            'evento' => $evento,
            'ip' => request()?->ip(),
            'usuario_id' => auth()->id(),
        ], $contexto));
    }

    public static function loginFallido(string $email, string $ip): void
    {
        self::registrar(self::LOGIN_FALLIDO, [
            'email' => $email,
            'ip_login' => $ip,
            'usuario_id' => null,
        ]);
    }

    public static function loginExitoso(Usuario $usuario, string $deviceName, string $ip): void
    {
        self::registrar(self::LOGIN_EXITOSO, [
            'usuario_id' => $usuario->id,
            'rol' => $usuario->rolNombre(),
            'unidad_id' => $usuario->unidad_id,
            'device_name' => $deviceName,
            'ip_login' => $ip,
        ]);
    }

    public static function logout(Usuario $usuario): void
    {
        self::registrar(self::LOGOUT, [
            'usuario_id' => $usuario->id,
            'rol' => $usuario->rolNombre(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    public static function estadoPropuesta(Usuario $usuario, string $estadoAnterior, string $estadoNuevo, array $extra = []): void
    {
        self::registrar(self::ESTADO_PROPUESTA, array_merge([
            'usuario_id' => $usuario->id,
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo,
        ], $extra));
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    public static function adjudicacion(Usuario $usuario, array $extra = []): void
    {
        self::registrar(self::ADJUDICACION, array_merge([
            'usuario_id' => $usuario->id,
        ], $extra));
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    public static function cierreGestion(Usuario $usuario, array $extra = []): void
    {
        self::registrar(self::CIERRE_GESTION, array_merge([
            'usuario_id' => $usuario->id,
        ], $extra));
    }

    /**
     * Cambio de estado de una contratacion. La tarea 2.15 no lo exige de forma
     * explicita, pero es el mismo tipo de rastro que el cambio de estado de una
     * propuesta y queda gratis si se anade aqui.
     */
    public static function estadoContratacion(Usuario $usuario, Contratacion $contratacion, string $estadoAnterior, string $estadoNuevo): void
    {
        self::registrar(self::ESTADO_CONTRATACION, [
            'usuario_id' => $usuario->id,
            'contratacion_id' => $contratacion->id,
            'actividad_id' => $contratacion->actividad_id,
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo,
        ]);
    }
}
