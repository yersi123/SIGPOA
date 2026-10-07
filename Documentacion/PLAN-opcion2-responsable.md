# Plan pendiente — Rol `responsable` dentro de su unidad (Opción 2)

Estado: **documentado, pendiente de ejecución**. No se ha modificado código todavía.
Fecha: 2026-10-07.

Alcance: dar al rol `responsable` escritura completa **acotada a su unidad** en
actividades, gastos y contrataciones; permitirle editar su propia unidad; restringir
la adjudicación al administrador; y documentar la matriz de roles
(ver `Documentacion/MATRIZ-ROLES.md`). `control_social` permanece solo lectura y los
catálogos globales siguen en el administrador.

## Decisiones tomadas

1. La autorización real sigue en las policies del backend, con validación "scoped"
   en los `FormRequest` para no filtrar existencia de otras unidades.
2. **Adjudicación de contrataciones = solo administrador.** El responsable avanza
   `solicitud -> cotizacion`, nunca `cotizacion -> adjudicada`.
3. La matriz de roles se documenta en `Documentacion/MATRIZ-ROLES.md` (enlazada desde
   el README raíz).
4. El responsable **sí** edita su propia unidad; **no** la crea ni la elimina.

## Backend — autorización

1. `backend/app/Policies/PolicyBase.php`: nuevo helper
   `puedeCrearEnUnidad(Usuario $usuario, ?int $unidadId): bool`
   -> `esAdministrador()` o (`esResponsable()` y `(int) $usuario->unidad_id === (int) $unidadId`).
2. `backend/app/Policies/ActividadPolicy.php`:
   - `create(Usuario, ?int $unidadId = null)` -> `puedeCrearEnUnidad`.
   - `delete()` -> `puedeActualizar` (admin o responsable de la unidad). `update` ya lo permite.
3. `backend/app/Policies/GastoPolicy.php`:
   - `create(Usuario, ?int $unidadId = null)` -> `puedeCrearEnUnidad`.
   - `delete()` -> `puedeActualizar`.
4. `backend/app/Policies/ContratacionPolicy.php`:
   - `create(Usuario, ?int $unidadId = null)` -> `puedeCrearEnUnidad`.
   - `adjudicar(Usuario, Contratacion)` -> `esAdministrador` (hoy el método existe pero está sin uso).
5. `UnidadPolicy` ya permite `update` al responsable de su unidad; no se toca.

## Backend — controladores

6. `ActividadController::store` (`ActividadController.php:86`):
   `authorize('create', [Actividad::class, (int) $peticion->input('unidad_id')])`.
7. `GastoController::store` (`GastoController.php:44`):
   cargar `$actividad = Actividad::findOrFail($peticion->input('actividad_id'))`
   (el scope hace 404 si es de otra unidad) y
   `authorize('create', [Gasto::class, (int) $actividad->unidad_id])`.
8. `ContratacionController::store` (`ContratacionController.php:67`):
   igual que gasto, usando `actividad_id`.
9. `ContratacionController::adjudicar` (`ContratacionController.php:114`):
   cambiar `authorize('update', $contratacion)` -> `authorize('adjudicar', $contratacion)`.

## Backend — validación sin fuga

Cambiar reglas `exists:` globales por validación vía Eloquent (respeta
`UnidadDelResponsableScope`), para que "no existe" y "es de otra unidad" devuelvan el
mismo 422:

10. `ActividadRequest.php:28` -> `unidad_id` con closure `Unidad::whereKey(...)->exists()`.
11. `GastoRequest.php:27` -> `actividad_id` con closure `Actividad::whereKey(...)->exists()`.
12. `ContratacionRequest.php:29` -> `actividad_id` con closure `Actividad::whereKey(...)->exists()`.

Las policies quedan como defensa en profundidad.

## Frontend — botones por capability

13. `frontend/src/hooks/usePermisos.ts`: agregar flags (todos `esAdmin || esResponsable`):
    `puedeCrearActividad`, `puedeEliminarActividad`, `puedeCrearGasto`,
    `puedeEliminarGasto`, `puedeCrearContratacion`. Actualizar el docstring.
14. `frontend/src/pages/actividades/ActividadesPage.tsx`:
    L179 (Nueva actividad) -> `puedeCrearActividad`; L322 (Eliminar) -> `puedeEliminarActividad`.
    Editar (L311) ya usa `puedeEditar`.
15. `frontend/src/pages/actividades/ActividadDetallePage.tsx`:
    L129 (Eliminar) -> `puedeEliminarActividad`.
16. `frontend/src/components/gastos/GastosActividadPanel.tsx`:
    L37 destructuring; L90 "Registrar gasto" -> `puedeCrearGasto`; acciones de fila (L111-112) -> `puedeEliminarGasto`.
17. `frontend/src/pages/contrataciones/ContratacionesPage.tsx`:
    L133 (Nueva contratación) -> `puedeCrearContratacion`; acción de estado (L229)
    mostrar solo si `estado === 'solicitud' ? puedeEditar : esAdmin`.
18. `frontend/src/pages/contrataciones/ContratacionDetallePage.tsx`:
    `puedeAvanzar` (L49) -> `contratacion && siguiente !== null && (siguiente === 'adjudicada' ? esAdmin : puedeEditar)`.
19. `frontend/src/pages/unidades/UnidadesPage.tsx`:
    L165 (Editar) -> `puedeEditar`; L176 (Eliminar) y L101 (Nueva unidad) siguen `esAdmin`.
20. `frontend/src/pages/unidades/UnidadDetallePage.tsx`:
    L98 separar el bloque: "Editar" con `puedeEditar`, "Eliminar" solo `esAdmin`.

## Documentación

21. `Documentacion/MATRIZ-ROLES.md`: matriz R8 completa (ya creada).
22. `README.md` (sección "Roles de usuario"): enlace a la matriz.
23. `Tareas Backend/TAREAS-BACKEND.txt`: nota apuntando a la matriz y a la regla de
    adjudicación admin-only.

## Verificación prevista

Backend: `php artisan test` + smoke test manual con tokens de `responsable@sigpoa.bo`
y `control@sigpoa.bo` (scripts temporales, datos limpiados al final):

- responsable crea actividad/gasto/contratación en su unidad -> 201; con otra
  `unidad_id`/`actividad_id` -> 422 (scoped).
- responsable elimina actividad/gasto propios -> 204; de otra unidad -> 404.
- responsable adjudica -> 403; avanza a "cotización" -> 200.
- responsable edita su unidad -> 200; otra unidad -> 404.
- control_social POST/DELETE en todo -> 403.

Frontend: `npx tsc -b` y `npm run build` (incluye oxlint) sin errores.

Sin cambios de esquema ni de base de datos.

## Fuera de alcance

- Mejoras del `control_social` (auditoría/observaciones) — posible Opción 3 futura.
- Gestión de usuarios desde la interfaz.