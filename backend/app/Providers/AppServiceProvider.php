<?php

namespace App\Providers;

use App\Models\Actividad;
use App\Models\Contratacion;
use App\Models\Entidad;
use App\Models\Gasto;
use App\Models\Gestion;
use App\Models\Observers\UsuarioObserver;
use App\Models\Organizacion;
use App\Models\Partida;
use App\Models\PropuestaParticipativa;
use App\Models\Proveedor;
use App\Models\Role;
use App\Models\Unidad;
use App\Models\Usuario;
use App\Policies\ActividadPolicy;
use App\Policies\ContratacionPolicy;
use App\Policies\EntidadPolicy;
use App\Policies\GastoPolicy;
use App\Policies\GestionPolicy;
use App\Policies\OrganizacionPolicy;
use App\Policies\PartidaPolicy;
use App\Policies\PropuestaParticipativaPolicy;
use App\Policies\ProveedorPolicy;
use App\Policies\RolePolicy;
use App\Policies\UnidadPolicy;
use App\Policies\UsuarioPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registrarLimiteDeIntentos();
        $this->registrarPolicies();
        $this->registrarObservers();
    }

    /**
     * Tarea 2.5: 5 intentos por minuto por cada combinacion de correo + IP.
     *
     * Limitar por correo frena el ataque dirigido a una cuenta y limitar por IP
     * frena el ataque por fuerza bruta desde una sola maquina.
     */
    private function registrarLimiteDeIntentos(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Tarea 2.8: reglas R8 por rol.
     */
    private function registrarPolicies(): void
    {
        Gate::policy(Actividad::class, ActividadPolicy::class);
        Gate::policy(Unidad::class, UnidadPolicy::class);
        Gate::policy(Gasto::class, GastoPolicy::class);
        Gate::policy(Contratacion::class, ContratacionPolicy::class);
        Gate::policy(PropuestaParticipativa::class, PropuestaParticipativaPolicy::class);
        Gate::policy(Usuario::class, UsuarioPolicy::class);
        Gate::policy(Gestion::class, GestionPolicy::class);
        Gate::policy(Organizacion::class, OrganizacionPolicy::class);
        Gate::policy(Proveedor::class, ProveedorPolicy::class);
        Gate::policy(Partida::class, PartidaPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(Entidad::class, EntidadPolicy::class);

        Gate::define('gestionar-usuarios', fn (Usuario $usuario) => $usuario->esAdministrador());
        Gate::define('adjudicar-contratacion', fn (Usuario $usuario) => $usuario->esAdministrador());
        Gate::define('cambiar-estado-propuesta', fn (Usuario $usuario) => $usuario->esAdministrador());
        Gate::define('cerrar-gestion', fn (Usuario $usuario) => $usuario->esAdministrador());
        Gate::define('abrir-gestion', fn (Usuario $usuario) => $usuario->esAdministrador());
    }

    /**
     * Tarea 2.13: al desactivar un usuario se revocan sus tokens.
     */
    private function registrarObservers(): void
    {
        Usuario::observe(UsuarioObserver::class);
    }
}
