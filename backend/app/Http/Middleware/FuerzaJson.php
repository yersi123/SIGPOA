<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fuerza que la API responda siempre en JSON.
 *
 * Sin esto, una peticion que no envia la cabecera Accept: application/json no la
 * reconoce como peticion de API y dispara la excepcion de autenticacion del
 * grupo web, que en una API sin formulario de login produce un error 500 en vez
 * de un 401 con mensaje util.
 */
class FuerzaJson
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
