# Matriz de roles y permisos (regla R8)

Autoridad de la regla: `Base de Datos/08 reglas negocio y comentarios.sql` (R8).

Cómo se aplica en el código:

- **Policies** por modelo (`backend/app/Policies/*`), todas heredan de `PolicyBase`.
- **Scope** `UnidadDelResponsableScope` (`backend/app/Models/Scopes/UnidadDelResponsableScope.php`): limita las consultas del `responsable` a los registros de su unidad. La unidad se deduce de la relación del modelo (columna `unidad_id`, o `actividad_id` → `actividad.unidad_id`) y **nunca** del parámetro de la petición. Un `?unidad_id=ajeno` no amplía el resultado.
- Roles en `backend/app/Models/Usuario.php`: `administrador`, `responsable`, `control_social`.

## Reglas

- El `administrador` tiene acceso total.
- El `responsable` opera **solo dentro de su unidad** y no gestiona usuarios.
- `control_social` es **solo lectura**, en todo el sistema.

## Matriz por recurso

| Recurso | `administrador` | `responsable` | `control_social` |
|---|---|---|---|
| Gestiones (crear / abrir / cerrar) | CRUD completo | ver | ver |
| Actividades | CRUD completo | crear / editar / eliminar en su unidad | ver |
| Gastos | crear / eliminar | crear / eliminar en su unidad (gestión abierta, R4) | ver |
| Contrataciones | crear, avanzar estados y adjudicar | crear y avanzar hasta "cotización" en su unidad; **no adjudica** | ver |
| Propuestas participativas | crear / editar / eliminar / cambiar estado | cambiar estado de las vinculadas a su unidad | ver |
| Unidades | CRUD completo | editar su propia unidad | ver |
| Entidades, Partidas, Proveedores, Organizaciones y Usuarios | CRUD completo | ver | ver |

Notas:

- Los catálogos globales (entidades, partidas, proveedores, organizaciones) y la gestión de usuarios son exclusivos del administrador.
- La **adjudicación** de una contratación es una acción exclusiva del administrador: el responsable solo lleva la contratación de `solicitud` a `cotizacion`.
- El **cierre de gestión** es una función exclusiva del administrador (ver el módulo de gestiones).
- Las lecturas del responsable quedan limitadas por `UnidadDelResponsableScope`; el `control_social` lee todo el sistema pero no escribe.

## Estado de implementación

Implementado hoy (R8 vigente):

- `administrador`: acceso total.
- `responsable`: edición de actividades, propuestas y unidades de su unidad; lectura del resto. Los `create`/`delete` de actividades, gastos y contrataciones aún son solo del administrador.
- `control_social`: solo lectura.

Pendiente (Opción 2, ver `Documentacion/PLAN-opcion2-responsable.md`):

- Habilitar `create`/`delete` de **actividades** y **gastos** y `create` de **contrataciones** para el responsable dentro de su unidad.
- Restringir la **adjudicación** de contrataciones al administrador (hoy el controlador usa el permiso de edición).
- Permitir al responsable **editar su propia unidad** desde la interfaz.
- Documentar y verificar la matriz con las pruebas indicadas en el plan.