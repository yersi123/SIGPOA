-- =====================================================
-- 10 crud basico  |  SIGPOA
-- Consultas de ejemplo (leer, crear, actualizar, eliminar).
-- Las operaciones de escritura van dentro de una transacción que termina en
-- ROLLBACK para no alterar los datos de demostración.
-- Para guardar los cambios de verdad, cambia ROLLBACK por COMMIT.
-- =====================================================

-- ---------- READ ----------
-- Login (en la API se compara el hash con bcrypt.compare)
SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.unidad_id
FROM usuarios u
JOIN roles r ON r.id = u.rol_id
WHERE u.email = 'admin@sigpoa.bo'
  AND u.activo
  AND u.password_hash = crypt('Admin123*', u.password_hash);

-- Actividades del POA 2026 con su ejecución
SELECT v.actividad_id, v.objetivo, v.monto_programado, v.monto_ejecutado,
       v.saldo, v.porcentaje_ejecucion, v.sobreejecutada
FROM v_ejecucion_actividad v
JOIN gestiones g ON g.id = v.gestion_id
WHERE g.anio = 2026
ORDER BY v.actividad_id;

-- Gastos de una actividad
SELECT g.id, g.fecha, g.monto, g.detalle, p.nombre AS proveedor
FROM gastos g
LEFT JOIN proveedores p ON p.id = g.proveedor_id
WHERE g.actividad_id = 1
ORDER BY g.fecha;

-- Organizaciones por tipo
SELECT id, nombre, tipo, representante FROM organizaciones WHERE tipo = 'OTB';

-- Propuestas participativas con su organización
SELECT pp.id, o.nombre AS organizacion, pp.titulo, pp.monto_asignado, pp.estado
FROM propuestas_participativas pp
JOIN organizaciones o ON o.id = pp.organizacion_id
ORDER BY pp.id;

-- Datos del dashboard (gestión 2026 = id 2)
SELECT * FROM fn_resumen_dashboard(2);
SELECT * FROM fn_ejecucion_por_unidad(2);
SELECT * FROM fn_ejecucion_por_organizacion(2);
SELECT * FROM fn_actividades_sobreejecutadas(2);

-- ---------- CREATE / UPDATE / DELETE (transacción de prueba) ----------
BEGIN;

-- Organización
INSERT INTO organizaciones (nombre, tipo, personeria_juridica, representante)
VALUES ('OTB Barrio Nuevo', 'OTB', 'RES-ADM-099/2026', 'Pedro Ramos');

UPDATE organizaciones SET telefono = '70000099' WHERE personeria_juridica = 'RES-ADM-099/2026';

-- Actividad del POA
INSERT INTO actividades (gestion_id, unidad_id, partida_id, organizacion_id, objetivo, meta, monto_programado)
VALUES (2, 1, 4,
        (SELECT id FROM organizaciones WHERE personeria_juridica = 'RES-ADM-099/2026'),
        'Alumbrado público Barrio Nuevo', '40 luminarias instaladas', 35000);

-- Gasto (mediante procedimiento; CALL no admite subconsultas, por eso se usa un bloque DO)
DO $$
DECLARE
    v_actividad_id bigint;
    v_gasto_id     bigint;
BEGIN
    SELECT MAX(id) INTO v_actividad_id FROM actividades;
    CALL sp_registrar_gasto(v_actividad_id, 1, CURRENT_DATE, 10000, 'Compra de luminarias', 2, v_gasto_id);
    RAISE NOTICE 'Gasto registrado con id %', v_gasto_id;
END $$;

-- Propuesta: crear y avanzar de estado
INSERT INTO propuestas_participativas (organizacion_id, gestion_id, titulo, descripcion)
VALUES ((SELECT id FROM organizaciones WHERE personeria_juridica = 'RES-ADM-099/2026'),
        2, 'Plaza del barrio', 'Construcción de una plaza vecinal');

DO $$
DECLARE
    v_propuesta_id bigint;
    v_actividad_id bigint;
BEGIN
    SELECT MAX(id) INTO v_propuesta_id FROM propuestas_participativas;
    SELECT MAX(id) INTO v_actividad_id FROM actividades;
    CALL sp_cambiar_estado_propuesta(v_propuesta_id, 'aprobado', v_actividad_id, 35000);
END $$;

-- Contratación: pasar de cotización a adjudicada
CALL sp_adjudicar_contratacion(2);

-- Eliminar (primero los registros hijos)
DELETE FROM gastos        WHERE actividad_id = (SELECT MAX(id) FROM actividades);
DELETE FROM propuestas_participativas WHERE titulo = 'Plaza del barrio';
DELETE FROM actividades   WHERE objetivo = 'Alumbrado público Barrio Nuevo';
DELETE FROM organizaciones WHERE personeria_juridica = 'RES-ADM-099/2026';

ROLLBACK;
