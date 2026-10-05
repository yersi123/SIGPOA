-- =====================================================
-- 08 reglas negocio y comentarios  |  SIGPOA
--
-- REGLAS DE NEGOCIO
--  R1. Saldo de una actividad = monto_programado - SUM(gastos.monto).
--  R2. % de ejecución = SUM(gastos.monto) / monto_programado * 100.
--  R3. Una actividad con gastos > monto programado se marca como sobreejecutada (alerta; no se bloquea).
--  R4. No se registran gastos en una gestión cerrada (trigger trg_gastos_validar).
--  R5. Propuestas: propuesto -> aprobado -> en_ejecucion -> concluido (trigger trg_propuestas_estado).
--  R6. Para aprobar una propuesta se requiere actividad del POA y monto asignado > 0.
--  R7. Contrataciones: solicitud -> cotizacion -> adjudicada
--      (validado por el trigger trg_contrataciones_estado; la fecha de cada etapa
--       se registra en fecha_cotizacion y fecha_adjudicacion).
--  R8. Roles: administrador (todo), responsable (su unidad), control_social (solo lectura).
--  R9. Los montos asignados a propuestas de una actividad no pueden sumar más que
--      el monto programado de esa actividad (trigger trg_propuestas_monto).
-- =====================================================

-- ---------- Comentarios de tablas ----------
COMMENT ON TABLE roles                     IS 'Roles de acceso al sistema';
COMMENT ON TABLE entidades                 IS 'Entidades públicas (gobernación, municipio, etc.)';
COMMENT ON TABLE unidades                  IS 'Unidades o secretarías dependientes de una entidad';
COMMENT ON TABLE usuarios                  IS 'Usuarios del sistema con rol y unidad asignada';
COMMENT ON TABLE gestiones                 IS 'Gestiones (años) de planificación presupuestaria';
COMMENT ON TABLE partidas                  IS 'Clasificador presupuestario de partidas de gasto';
COMMENT ON TABLE organizaciones            IS 'Organizaciones sociales: OTB, sindicatos, juntas vecinales y pueblos indígenas';
COMMENT ON TABLE proveedores               IS 'Proveedores de bienes y servicios';
COMMENT ON TABLE actividades               IS 'Actividades del POA con su monto programado';
COMMENT ON TABLE gastos                    IS 'Ejecución presupuestaria: gastos registrados por actividad';
COMMENT ON TABLE contrataciones            IS 'Proceso simplificado de contratación (solicitud, cotización, adjudicación)';
COMMENT ON TABLE propuestas_participativas IS 'Propuestas de proyectos de las organizaciones (presupuesto participativo)';

-- ---------- Comentarios de columnas clave ----------
COMMENT ON COLUMN usuarios.password_hash         IS 'Contraseña encriptada con bcrypt';
COMMENT ON COLUMN gestiones.estado               IS 'abierta | cerrada';
COMMENT ON COLUMN organizaciones.tipo            IS 'OTB | sindicato | junta_vecinal | pueblo_indigena';
COMMENT ON COLUMN actividades.monto_programado   IS 'Monto del POA asignado a la actividad (Bs)';
COMMENT ON COLUMN gastos.monto                   IS 'Monto ejecutado, siempre mayor a cero (Bs)';
COMMENT ON COLUMN contrataciones.estado          IS 'solicitud | cotizacion | adjudicada';
COMMENT ON COLUMN contrataciones.fecha_cotizacion   IS 'Fecha en que la contratación pasó a estado cotizacion';
COMMENT ON COLUMN contrataciones.fecha_adjudicacion IS 'Fecha en que la contratación fue adjudicada';
COMMENT ON COLUMN propuestas_participativas.estado IS 'propuesto | aprobado | en_ejecucion | concluido';

-- ---------- Vistas de ejecución presupuestaria ----------
CREATE OR REPLACE VIEW v_ejecucion_actividad AS
SELECT  a.id                                            AS actividad_id,
        a.gestion_id,
        a.unidad_id,
        a.partida_id,
        a.organizacion_id,
        a.objetivo,
        a.meta,
        a.monto_programado,
        COALESCE(SUM(g.monto), 0)::numeric(14,2)                       AS monto_ejecutado,
        (a.monto_programado - COALESCE(SUM(g.monto), 0))::numeric(14,2) AS saldo,
        fn_porcentaje(COALESCE(SUM(g.monto), 0), a.monto_programado)   AS porcentaje_ejecucion,
        (COALESCE(SUM(g.monto), 0) > a.monto_programado)               AS sobreejecutada
FROM actividades a
LEFT JOIN gastos g ON g.actividad_id = a.id
GROUP BY a.id;

CREATE OR REPLACE VIEW v_ejecucion_unidad AS
SELECT  v.gestion_id,
        u.id     AS unidad_id,
        u.nombre AS unidad,
        SUM(v.monto_programado)                                   AS monto_programado,
        SUM(v.monto_ejecutado)                                    AS monto_ejecutado,
        SUM(v.saldo)                                              AS saldo,
        fn_porcentaje(SUM(v.monto_ejecutado), SUM(v.monto_programado)) AS porcentaje_ejecucion
FROM v_ejecucion_actividad v
JOIN unidades u ON u.id = v.unidad_id
GROUP BY v.gestion_id, u.id, u.nombre;

CREATE OR REPLACE VIEW v_ejecucion_organizacion AS
SELECT  v.gestion_id,
        o.id     AS organizacion_id,
        o.nombre AS organizacion,
        o.tipo,
        SUM(v.monto_programado)                                   AS monto_programado,
        SUM(v.monto_ejecutado)                                    AS monto_ejecutado,
        SUM(v.saldo)                                              AS saldo,
        fn_porcentaje(SUM(v.monto_ejecutado), SUM(v.monto_programado)) AS porcentaje_ejecucion
FROM v_ejecucion_actividad v
JOIN organizaciones o ON o.id = v.organizacion_id
GROUP BY v.gestion_id, o.id, o.nombre, o.tipo;

COMMENT ON VIEW v_ejecucion_actividad    IS 'Programado, ejecutado, saldo y % por actividad (reglas R1-R3)';
COMMENT ON VIEW v_ejecucion_unidad       IS 'Ejecución consolidada por unidad';
COMMENT ON VIEW v_ejecucion_organizacion IS 'Ejecución consolidada por organización beneficiaria';
