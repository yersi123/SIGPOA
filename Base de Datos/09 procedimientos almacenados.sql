-- =====================================================
-- 09 procedimientos almacenados  |  SIGPOA
-- Procedimientos (CALL) y funciones de consulta para el dashboard
-- =====================================================

-- ---------- Registrar un gasto ----------
CREATE OR REPLACE PROCEDURE sp_registrar_gasto(
    p_actividad_id  bigint,
    p_proveedor_id  bigint,
    p_fecha         date,
    p_monto         numeric,
    p_detalle       varchar,
    p_usuario_id    bigint,
    INOUT p_gasto_id bigint
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM actividades WHERE id = p_actividad_id) THEN
        RAISE EXCEPTION 'La actividad % no existe', p_actividad_id;
    END IF;

    INSERT INTO gastos (actividad_id, proveedor_id, fecha, monto, detalle, registrado_por)
    VALUES (p_actividad_id, p_proveedor_id, COALESCE(p_fecha, CURRENT_DATE), p_monto, p_detalle, p_usuario_id)
    RETURNING id INTO p_gasto_id;
END;
$$;

-- ---------- Cambiar el estado de una propuesta participativa ----------
CREATE OR REPLACE PROCEDURE sp_cambiar_estado_propuesta(
    p_propuesta_id  bigint,
    p_nuevo_estado  varchar,
    p_actividad_id  bigint  DEFAULT NULL,
    p_monto         numeric DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE propuestas_participativas
    SET estado         = p_nuevo_estado,
        actividad_id   = COALESCE(p_actividad_id, actividad_id),
        monto_asignado = COALESCE(p_monto, monto_asignado)
    WHERE id = p_propuesta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La propuesta % no existe', p_propuesta_id;
    END IF;
END;
$$;

-- ---------- Adjudicar una contratación ----------
CREATE OR REPLACE PROCEDURE sp_adjudicar_contratacion(p_contratacion_id bigint)
LANGUAGE plpgsql AS $$
DECLARE
    v_estado varchar;
BEGIN
    SELECT estado INTO v_estado FROM contrataciones WHERE id = p_contratacion_id;

    IF v_estado IS NULL THEN
        RAISE EXCEPTION 'La contratación % no existe', p_contratacion_id;
    ELSIF v_estado <> 'cotizacion' THEN
        RAISE EXCEPTION 'Solo se puede adjudicar una contratación en estado cotizacion (actual: %)', v_estado;
    END IF;

    UPDATE contrataciones
    SET estado = 'adjudicada',
        fecha_adjudicacion = COALESCE(fecha_adjudicacion, GREATEST(CURRENT_DATE, fecha_cotizacion))
    WHERE id = p_contratacion_id;
END;
$$;

-- ---------- Cerrar una gestión ----------
CREATE OR REPLACE PROCEDURE sp_cerrar_gestion(p_gestion_id bigint)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE gestiones SET estado = 'cerrada' WHERE id = p_gestion_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La gestión % no existe', p_gestion_id;
    END IF;
END;
$$;

-- ---------- Resumen para las tarjetas del dashboard ----------
CREATE OR REPLACE FUNCTION fn_resumen_dashboard(p_gestion_id bigint)
RETURNS TABLE (
    presupuesto_total           numeric,
    total_ejecutado             numeric,
    saldo                       numeric,
    porcentaje_ejecucion        numeric,
    actividades_sobreejecutadas bigint
)
LANGUAGE sql STABLE AS $$
    SELECT  COALESCE(SUM(monto_programado), 0),
            COALESCE(SUM(monto_ejecutado), 0),
            COALESCE(SUM(saldo), 0),
            fn_porcentaje(SUM(monto_ejecutado), SUM(monto_programado)),
            COUNT(*) FILTER (WHERE sobreejecutada)
    FROM v_ejecucion_actividad
    WHERE gestion_id = p_gestion_id;
$$;

-- ---------- Gráfico de barras: programado vs. ejecutado por unidad ----------
CREATE OR REPLACE FUNCTION fn_ejecucion_por_unidad(p_gestion_id bigint)
RETURNS TABLE (
    unidad               varchar,
    monto_programado     numeric,
    monto_ejecutado      numeric,
    saldo                numeric,
    porcentaje_ejecucion numeric
)
LANGUAGE sql STABLE AS $$
    SELECT unidad::varchar, monto_programado, monto_ejecutado, saldo, porcentaje_ejecucion
    FROM v_ejecucion_unidad
    WHERE gestion_id = p_gestion_id
    ORDER BY unidad;
$$;

-- ---------- Gráfico circular: ejecución por organización ----------
CREATE OR REPLACE FUNCTION fn_ejecucion_por_organizacion(p_gestion_id bigint)
RETURNS TABLE (
    organizacion         varchar,
    tipo                 varchar,
    monto_programado     numeric,
    monto_ejecutado      numeric,
    porcentaje_ejecucion numeric
)
LANGUAGE sql STABLE AS $$
    SELECT organizacion::varchar, tipo::varchar, monto_programado, monto_ejecutado, porcentaje_ejecucion
    FROM v_ejecucion_organizacion
    WHERE gestion_id = p_gestion_id
    ORDER BY monto_ejecutado DESC;
$$;

-- ---------- Alertas de sobreejecución ----------
CREATE OR REPLACE FUNCTION fn_actividades_sobreejecutadas(p_gestion_id bigint)
RETURNS TABLE (
    actividad_id     bigint,
    objetivo         varchar,
    monto_programado numeric,
    monto_ejecutado  numeric,
    exceso           numeric
)
LANGUAGE sql STABLE AS $$
    SELECT actividad_id, objetivo::varchar, monto_programado, monto_ejecutado,
           (monto_ejecutado - monto_programado)
    FROM v_ejecucion_actividad
    WHERE gestion_id = p_gestion_id AND sobreejecutada
    ORDER BY 5 DESC;
$$;
