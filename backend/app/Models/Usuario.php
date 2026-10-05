<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    public const ROL_ADMINISTRADOR = 'administrador';

    public const ROL_RESPONSABLE = 'responsable';

    public const ROL_CONTROL_SOCIAL = 'control_social';

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'email',
        'password_hash',
        'rol_id',
        'unidad_id',
        'activo',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'nombre' => 'string',
        'email' => 'string',
        'password_hash' => 'string',
        'rol_id' => 'integer',
        'unidad_id' => 'integer',
        'activo' => 'boolean',
    ];

    /**
     * Busca un usuario activo y verifica su contrasena en PHP.
     *
     * La contrasena se comprueba con Hash::check() y no con crypt() de pgcrypto
     * para que el resultado sea testeable desde PHP sin pasar por la base.
     *
     * Devuelve null tanto si el correo no existe, como si esta inactivo o la
     * contrasena no coincide, para no filtrar informacion al atacante.
     */
    public static function findForPassport(string $email, string $password): ?static
    {
        $usuario = static::query()
            ->where('email', $email)
            ->where('activo', true)
            ->first();

        if (! $usuario instanceof static) {
            return null;
        }

        if (! Hash::check($password, $usuario->password_hash)) {
            return null;
        }

        return $usuario;
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }

    public function rolNombre(): ?string
    {
        return $this->rol?->nombre;
    }

    public function esAdministrador(): bool
    {
        return $this->rolNombre() === self::ROL_ADMINISTRADOR;
    }

    public function esResponsable(): bool
    {
        return $this->rolNombre() === self::ROL_RESPONSABLE;
    }

    public function esControlSocial(): bool
    {
        return $this->rolNombre() === self::ROL_CONTROL_SOCIAL;
    }

    /**
     * Identifica si la unidad indicada pertenece a este usuario.
     *
     * Un administrador pertenece a todas las unidades. El responsable solo a la
     * suya. El control social no gestiona unidades.
     */
    public function perteneceAUnidad(?int $unidadId): bool
    {
        if ($this->esAdministrador()) {
            return true;
        }

        if ($this->esResponsable()) {
            return $unidadId !== null && $this->unidad_id !== null && $this->unidad_id === $unidadId;
        }

        return false;
    }
}
