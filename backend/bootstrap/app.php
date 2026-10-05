<?php

use App\Http\Middleware\FuerzaJson;
use App\Http\Middleware\RolMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequestsException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Tarea 2.6: la API responde siempre JSON. Sin esto, una peticion sin la
        // cabecera Accept: application/json cae en el middleware web y falla al
        // no existir una ruta login.
        $middleware->api(prepend: [
            FuerzaJson::class,
        ]);

        $middleware->alias([
            'rol' => RolMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /*
        |----------------------------------------------------------------------
        | Tarea 2.14: errores con mensaje propio y sin datos internos
        |----------------------------------------------------------------------
        | Nunca se devuelve SQL, stack trace ni excepciones de PDO al cliente,
        | sin importar el valor de APP_DEBUG.
        */

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return respuestaError(
                'No autenticado. Tu token es invalido, vencio o no fue enviado.',
                401
            );
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            return respuestaError(
                'No tienes permiso para realizar esta accion.',
                403
            );
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            return respuestaError(
                'El recurso solicitado no existe.',
                404
            );
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return respuestaError(
                'El recurso solicitado no existe.',
                404
            );
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => 'Los datos enviados no son validos.',
                'errors' => $e->errors(),
            ], 422);
        });

        /*
        |----------------------------------------------------------------------
        | Tarea 2.12: SQLSTATE de PostgreSQL traducidos a codigos HTTP
        |----------------------------------------------------------------------
        | 23505 duplicado -> 409, 23001 borrado bloqueado por una FK -> 409,
        | 23503 referencia invalida -> 422, 23514 regla incumplida -> 422,
        | P0001 trigger -> 422 con su mensaje, 22001 y 22003 texto demasiado
        | largo -> 422.
        */
        $exceptions->render(function (QueryException $e, Request $request) {
            $sqlState = (string) ($e->errorInfo[0] ?? $e->getCode());

            // Los triggers de la base ya lanzan P0001 con un mensaje en espanol.
            if ($sqlState === 'P0001') {
                return respuestaError(mensajeDeTrigger($e), 422);
            }

            $mensajes = [
                '23505' => [409, 'Ya existe un registro con esos datos.'],
                '23001' => [409, 'No se puede eliminar: el registro es usado por otros datos.'],
                '23503' => [422, 'La referencia indicada no existe en la base de datos.'],
                '23514' => [422, 'Los datos violan una regla de negocio del sistema.'],
                '23502' => [422, 'Falta un campo obligatorio en la base de datos.'],
                '22001' => [422, 'Alguno de los textos enviados es demasiado largo.'],
                '22003' => [422, 'Alguno de los valores enviados esta fuera del rango permitido.'],
                '22P02' => [422, 'Alguno de los valores enviados tiene un formato incorrecto.'],
                '40001' => [409, 'La operacion seccionaria con otra peticion. Intentalo de nuevo.'],
                '40P01' => [409, 'El recurso esta siendo usado por otra operacion. Intentalo de nuevo.'],
            ];

            if (isset($mensajes[$sqlState])) {
                [$codigo, $mensaje] = $mensajes[$sqlState];

                return respuestaError($mensaje, $codigo);
            }

            return respuestaError('Error al ejecutar la operacion en la base de datos.', 500);
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => 'Demasiados intentos. Espera un minuto antes de volver a intentarlo.',
            ], 429, $e->getHeaders());
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($e instanceof HttpExceptionInterface) {
                $estado = $e->getStatusCode();

                if ($estado >= 500) {
                    report($e);
                }

                return respuestaError(
                    $e->getMessage() !== '' ? $e->getMessage() : 'No se pudo completar la peticion.',
                    $estado
                );
            }

            report($e);

            return respuestaError('Ocurrio un error interno. Intentalo mas tarde.', 500);
        });
    })->create();

/**
 * Respuesta de error uniforme. Nunca incluye la excepcion original.
 */
function respuestaError(string $message, int $status): JsonResponse
{
    return response()->json([
        'success' => false,
        'message' => $message,
    ], $status);
}

/**
 * Extrae el mensaje de un trigger de PostgreSQL.
 *
 * PostgreSQL responde: 42883 / P0001: function ... RAISE EXCEPTION 'texto'
 * Se devuelve solo el texto legible, nunca la sentencia SQL completa.
 */
function mensajeDeTrigger(QueryException $e): string
{
    // PostgreSQL entrega el texto del trigger en el tercer elemento de errorInfo:
    // [SQLSTATE, codigo nativo, "ERROR:  texto legible"]. Ahi se busca, no en el
    // mensaje completo, que incluye la sentencia SQL y las referencias internas.
    $detalle = (string) ($e->errorInfo[2] ?? $e->getMessage());

    if (preg_match('/^ERROR:\s*(.+)$/mi', $detalle, $coincidencias) === 1) {
        $texto = trim($coincidencias[1]);

        // Los RAISE con % muestran comillas dobles con el valor interpolado.
        return str_replace('"', '', $texto);
    }

    if (preg_match('/^DETAIL:\s*(.+)$/mi', $detalle, $coincidencias) === 1) {
        return trim($coincidencias[1]);
    }

    return 'La operacion fue rechazada por una regla de negocio del sistema.';
}
