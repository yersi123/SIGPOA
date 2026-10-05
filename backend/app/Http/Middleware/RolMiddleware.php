<?php

namespace App\Http\Middleware;

use App\Models\Usuario;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe una ruta a los roles indicados en los parametros del middleware.
 *
 * Uso: ->middleware('rol:administrador,responsable')
 *
 * Si el usuario no esta autenticado responde 401. Si esta autenticado pero su
 * rol no esta en la lista responde 403 con un mensaje claro.
 */
class RolMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        if (! $usuario instanceof Usuario) {
            return $this->noAutenticado();
        }

        $rolUsuario = $usuario->rolNombre();

        if ($rolUsuario === null) {
            return $this->prohibido($roles, null);
        }

        if (! in_array($rolUsuario, $roles, true)) {
            return $this->prohibido($roles, $rolUsuario);
        }

        return $next($request);
    }

    private function noAutenticado(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'No autenticado. Debes iniciar sesion para acceder a este recurso.',
        ], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @param  array<int, string>  $rolesPermitidos
     */
    private function prohibido(array $rolesPermitidos, ?string $rolUsuario): JsonResponse
    {
        $permitidos = $rolesPermitidos === []
            ? 'ninguno'
            : implode(', ', $rolesPermitidos);

        $message = 'No tienes permiso para esta accion.';

        if ($rolUsuario !== null) {
            $message .= " Tu rol es '{$rolUsuario}' y esta ruta requiere uno de: {$permitidos}.";
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'rol_actual' => $rolUsuario,
            'roles_permitidos' => $rolesPermitidos,
        ], Response::HTTP_FORBIDDEN);
    }
}
