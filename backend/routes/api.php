<?php

use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContratacionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EntidadController;
use App\Http\Controllers\Api\GastoController;
use App\Http\Controllers\Api\GestionController;
use App\Http\Controllers\Api\OrganizacionController;
use App\Http\Controllers\Api\PartidaController;
use App\Http\Controllers\Api\PropuestaController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\UnidadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API
|--------------------------------------------------------------------------
| Tarea 2.6: el login es la unica ruta publica. Todo lo demas exige un token
| de Sanctum dentro del grupo auth:sanctum, de modo que anadir una ruta fuera
| de ese grupo sea una decision visible.
*/

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:login')
    ->name('auth.login');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

    Route::get('/user', fn (Request $request) => $request->user()->load('rol', 'unidad'));

    /*
    | Tarea 3.2: dashboard de solo lectura.
    */
    Route::prefix('dashboard')->name('dashboard.')->group(function (): void {
        Route::get('/resumen', [DashboardController::class, 'resumen'])->name('resumen');
        Route::get('/por-unidad', [DashboardController::class, 'porUnidad'])->name('por-unidad');
        Route::get('/por-organizacion', [DashboardController::class, 'porOrganizacion'])->name('por-organizacion');
        Route::get('/alertas', [DashboardController::class, 'alertas'])->name('alertas');
    });

    /*
    | Tarea 3.3: gestiones. Solo el administrador cierra (sp_cerrar_gestion).
    */
    Route::get('/gestiones', [GestionController::class, 'index'])->name('gestiones.index');
    Route::get('/gestiones/{gestion}', [GestionController::class, 'show'])->name('gestiones.show');
    Route::post('/gestiones/{gestion}/cerrar', [GestionController::class, 'cerrar'])
        ->middleware('rol:administrador')
        ->name('gestiones.cerrar');

    /*
    | Tarea 3.4: entidades.
    */
    Route::get('/entidades', [EntidadController::class, 'index'])->name('entidades.index');
    Route::post('/entidades', [EntidadController::class, 'store'])->name('entidades.store');
    Route::get('/entidades/{entidad}', [EntidadController::class, 'show'])->name('entidades.show');
    Route::get('/entidades/{entidad}/unidades', [EntidadController::class, 'unidades'])->name('entidades.unidades');
    Route::put('/entidades/{entidad}', [EntidadController::class, 'update'])->name('entidades.update');
    Route::delete('/entidades/{entidad}', [EntidadController::class, 'destroy'])->name('entidades.destroy');

    /*
    | Tarea 3.5: unidades, con filtro por entidad_id.
    */
    Route::get('/unidades', [UnidadController::class, 'index'])->name('unidades.index');
    Route::post('/unidades', [UnidadController::class, 'store'])->name('unidades.store');
    Route::get('/unidades/{unidad}', [UnidadController::class, 'show'])->name('unidades.show');
    Route::put('/unidades/{unidad}', [UnidadController::class, 'update'])->name('unidades.update');
    Route::delete('/unidades/{unidad}', [UnidadController::class, 'destroy'])->name('unidades.destroy');

    /*
    | Tarea 3.6: partidas presupuestarias.
    */
    Route::get('/partidas', [PartidaController::class, 'index'])->name('partidas.index');
    Route::post('/partidas', [PartidaController::class, 'store'])->name('partidas.store');
    Route::get('/partidas/{partida}', [PartidaController::class, 'show'])->name('partidas.show');
    Route::put('/partidas/{partida}', [PartidaController::class, 'update'])->name('partidas.update');
    Route::delete('/partidas/{partida}', [PartidaController::class, 'destroy'])->name('partidas.destroy');

    /*
    | Tarea 3.7: actividades (POA) y su ejecucion.
    */
    Route::get('/actividades', [ActividadController::class, 'index'])->name('actividades.index');
    Route::post('/actividades', [ActividadController::class, 'store'])->name('actividades.store');
    Route::get('/actividades/{actividad}', [ActividadController::class, 'show'])->name('actividades.show');
    Route::get('/actividades/{actividad}/ejecucion', [ActividadController::class, 'ejecucion'])->name('actividades.ejecucion');
    Route::put('/actividades/{actividad}', [ActividadController::class, 'update'])->name('actividades.update');
    Route::delete('/actividades/{actividad}', [ActividadController::class, 'destroy'])->name('actividades.destroy');

    /*
    | Tarea 3.8: gastos. El alta va por sp_registrar_gasto.
    */
    Route::get('/actividades/{actividad}/gastos', [GastoController::class, 'index'])->name('gastos.index');
    Route::post('/gastos', [GastoController::class, 'store'])->name('gastos.store');
    Route::delete('/gastos/{gasto}', [GastoController::class, 'destroy'])->name('gastos.destroy');

    /*
    | Tarea 3.9: proveedores.
    */
    Route::get('/proveedores', [ProveedorController::class, 'index'])->name('proveedores.index');
    Route::post('/proveedores', [ProveedorController::class, 'store'])->name('proveedores.store');
    Route::get('/proveedores/{proveedor}', [ProveedorController::class, 'show'])->name('proveedores.show');
    Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->name('proveedores.update');
    Route::delete('/proveedores/{proveedor}', [ProveedorController::class, 'destroy'])->name('proveedores.destroy');

    /*
    | Tarea 3.10: contrataciones. La adjudicacion usa sp_adjudicar_contratacion.
    */
    Route::get('/contrataciones', [ContratacionController::class, 'index'])->name('contrataciones.index');
    Route::post('/contrataciones', [ContratacionController::class, 'store'])->name('contrataciones.store');
    Route::get('/contrataciones/{contratacion}', [ContratacionController::class, 'show'])->name('contrataciones.show');
    Route::patch('/contrataciones/{contratacion}/estado', [ContratacionController::class, 'cambiarEstado'])->name('contrataciones.estado');
    Route::post('/contrataciones/{contratacion}/adjudicar', [ContratacionController::class, 'adjudicar'])->name('contrataciones.adjudicar');

    /*
    | Tarea 3.11: organizaciones.
    */
    Route::get('/organizaciones', [OrganizacionController::class, 'index'])->name('organizaciones.index');
    Route::post('/organizaciones', [OrganizacionController::class, 'store'])->name('organizaciones.store');
    Route::get('/organizaciones/{organizacion}', [OrganizacionController::class, 'show'])->name('organizaciones.show');
    Route::put('/organizaciones/{organizacion}', [OrganizacionController::class, 'update'])->name('organizaciones.update');
    Route::delete('/organizaciones/{organizacion}', [OrganizacionController::class, 'destroy'])->name('organizaciones.destroy');

    /*
    | Tarea 3.12: propuestas participativas. El estado pasa por
    | sp_cambiar_estado_propuesta.
    */
    Route::get('/propuestas', [PropuestaController::class, 'index'])->name('propuestas.index');
    Route::post('/propuestas', [PropuestaController::class, 'store'])->name('propuestas.store');
    Route::get('/propuestas/{propuesta}', [PropuestaController::class, 'show'])->name('propuestas.show');
    Route::patch('/propuestas/{propuesta}/estado', [PropuestaController::class, 'cambiarEstado'])->name('propuestas.estado');

    /*
    | Tarea 3.13: reportes en pdf o excel. Solo lectura, abierto tambien a
    | control_social.
    */
    Route::get('/reportes/ejecucion', [ReporteController::class, 'ejecucion'])->name('reportes.ejecucion');
    Route::get('/reportes/organizaciones', [ReporteController::class, 'organizaciones'])->name('reportes.organizaciones');
});
