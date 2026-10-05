<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuracion de CORS
    |--------------------------------------------------------------------------
    |
    | El frontend React corre en un puerto distinto al de la API, asi que el
    | navegador envia peticiones desde otro origen y el servidor debe responder
    | con los encabezados de CORS correspondientes.
    |
    | El origen permitido se toma de FRONTEND_URL (ver .env). No se usa comodin
    | porque supports_credentials exige un origen exacto.
    |
    */

    // Solo las rutas de la API. No se incluye sanctum/csrf-cookie porque la
    // autenticacion es por token (Authorization: Bearer), no por cookie.
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // 3600 segundos: el navegador cachea el preflight y no lo repite en cada
    // peticion durante una hora.
    'max_age' => 3600,

    'supports_credentials' => true,

];
