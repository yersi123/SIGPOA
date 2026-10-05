-- =====================================================
-- 04 check constraints  |  SIGPOA
-- =====================================================

ALTER TABLE entidades ADD CONSTRAINT ck_entidades_tipo
    CHECK (tipo IN ('gobernacion','municipio','ministerio','unidad_educativa','otro'));

ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_email
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE gestiones ADD CONSTRAINT ck_gestiones_anio   CHECK (anio BETWEEN 2000 AND 2100);
ALTER TABLE gestiones ADD CONSTRAINT ck_gestiones_estado CHECK (estado IN ('abierta','cerrada'));

ALTER TABLE partidas ADD CONSTRAINT ck_partidas_codigo CHECK (codigo ~ '^[0-9]{5,6}$');

ALTER TABLE organizaciones ADD CONSTRAINT ck_organizaciones_tipo
    CHECK (tipo IN ('OTB','sindicato','junta_vecinal','pueblo_indigena'));

ALTER TABLE actividades ADD CONSTRAINT ck_actividades_monto CHECK (monto_programado >= 0);

ALTER TABLE gastos ADD CONSTRAINT ck_gastos_monto CHECK (monto > 0);

ALTER TABLE contrataciones ADD CONSTRAINT ck_contrataciones_monto  CHECK (monto_cotizado >= 0);
ALTER TABLE contrataciones ADD CONSTRAINT ck_contrataciones_estado
    CHECK (estado IN ('solicitud','cotizacion','adjudicada'));

-- Fechas del flujo: la cotización y la adjudicación nunca pueden ser anteriores
-- a la fecha de solicitud, y no se adjudica sin cotización previa.
ALTER TABLE contrataciones ADD CONSTRAINT ck_contrataciones_fechas
    CHECK (
        (fecha_cotizacion IS NULL OR fecha_cotizacion >= fecha) AND
        (fecha_adjudicacion IS NULL OR
            (fecha_cotizacion IS NOT NULL AND fecha_adjudicacion >= fecha_cotizacion))
    );

ALTER TABLE propuestas_participativas ADD CONSTRAINT ck_propuestas_monto  CHECK (monto_asignado >= 0);
ALTER TABLE propuestas_participativas ADD CONSTRAINT ck_propuestas_estado
    CHECK (estado IN ('propuesto','aprobado','en_ejecucion','concluido'));
