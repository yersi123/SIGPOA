<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\Usuario;
use App\Support\Auditoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     *
     * El login es la unica ruta publica de la API (tarea 2.6).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $email = (string) $request->input('email');
        $password = (string) $request->input('password');
        $deviceName = (string) $request->input('device_name');

        $usuario = Usuario::findForPassport($email, $password);

        if (! $usuario instanceof Usuario) {
            Auditoria::loginFallido($email, (string) $request->ip());

            return response()->json([
                'success' => false,
                'message' => 'Las credenciales no son correctas.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Tarea 2.4: el token vence en la cantidad de minutos de sanctum.expiration.
        // Sanctum 4 no aplica esa configuracion por su cuenta: hay que pasarle la
        // fecha explicitamente, de lo contrario expires_at queda nulo y el token
        // no vence nunca.
        $expiraEn = now()->addMinutes((int) config('sanctum.expiration'));

        $token = $usuario->createToken($deviceName, ['*'], $expiraEn);

        Auditoria::loginExitoso($usuario, $deviceName, (string) $request->ip());

        return response()->json([
            'success' => true,
            'message' => 'Autenticacion correcta.',
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $token->plainTextToken,
                'expires_at' => $expiraEn->toIso8601String(),
                'usuario' => $this->datosUsuario($usuario),
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     *
     * Revoca unicamente el token con el que se llamo a la API.
     */
    public function logout(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (! $usuario instanceof Usuario) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo cerrar la sesion.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = $usuario->currentAccessToken();

        if ($token !== null) {
            $token->delete();
        }

        Auditoria::logout($usuario);

        return response()->json([
            'success' => true,
            'message' => 'Sesion cerrada correctamente.',
        ]);
    }

    /**
     * GET /api/auth/me
     *
     * El password_hash nunca se devuelve: ademas de estar en $hidden, el usuario
     * se construye a mano para que el hash no pueda filtrarse por accidente.
     */
    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (! $usuario instanceof Usuario) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $usuario->loadMissing('rol', 'unidad');

        return response()->json([
            'success' => true,
            'message' => 'Usuario autenticado.',
            'data' => $this->datosUsuario($usuario),
        ]);
    }

    /**
     * Proyecta el usuario a un unico arreglo. No se usa toArray() para evitar
     * exponer cualquier atributo por descuido en el futuro.
     *
     * @return array<string, mixed>
     */
    private function datosUsuario(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'email' => $usuario->email,
            'rol_id' => $usuario->rol_id,
            'rol' => $usuario->rolNombre(),
            'unidad_id' => $usuario->unidad_id,
            'unidad' => $usuario->unidad?->nombre,
            'activo' => $usuario->activo,
        ];
    }
}
