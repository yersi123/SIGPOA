-- =====================================================
-- 06 triggers  |  SIGPOA
-- =====================================================

-- ---------- 1. updated_at automático en todas las tablas ----------
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'roles','entidades','unidades','usuarios','gestiones','partidas',
        'organizaciones','proveedores','actividades','gastos',
        'contrataciones','propuestas_participativas'
    ] LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON %1$I', t);
        EXECUTE format(
            'CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON %1$I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()', t);
    END LOOP;
END $$;

-- ---------- 2. No registrar gastos en una gestión cerrada ----------
CREATE OR REPLACE FUNCTION fn_validar_gasto()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    v_estado varchar;
BEGIN
    SELECT g.estado INTO v_estado
    FROM actividades a
    JOIN gestiones g ON g.id = a.gestion_id
    WHERE a.id = NEW.actividad_id;

    IF v_estado IS DISTINCT FROM 'abierta' THEN
        RAISE EXCEPTION 'No se pueden registrar gastos: la gestión de la actividad % está cerrada', NEW.actividad_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gastos_validar ON gastos;
CREATE TRIGGER trg_gastos_validar
    BEFORE INSERT OR UPDATE OF actividad_id, monto ON gastos
    FOR EACH ROW EXECUTE FUNCTION fn_validar_gasto();

-- ---------- 3. Flujo de estados de propuestas participativas ----------
-- propuesto -> aprobado -> en_ejecucion -> concluido
CREATE OR REPLACE FUNCTION fn_validar_estado_propuesta()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        IF NOT (
            (OLD.estado = 'propuesto'    AND NEW.estado = 'aprobado')     OR
            (OLD.estado = 'aprobado'     AND NEW.estado = 'en_ejecucion') OR
            (OLD.estado = 'en_ejecucion' AND NEW.estado = 'concluido')
        ) THEN
            RAISE EXCEPTION 'Cambio de estado no permitido: % -> %', OLD.estado, NEW.estado;
        END IF;

        IF NEW.estado = 'aprobado' AND (NEW.actividad_id IS NULL OR NEW.monto_asignado <= 0) THEN
            RAISE EXCEPTION 'Para aprobar una propuesta se requiere actividad del POA y monto asignado mayor a cero';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_propuestas_estado ON propuestas_participativas;
CREATE TRIGGER trg_propuestas_estado
    BEFORE UPDATE OF estado ON propuestas_participativas
    FOR EACH ROW EXECUTE FUNCTION fn_validar_estado_propuesta();

-- ---------- 4. Flujo de estados de contrataciones ----------
-- solicitud -> cotizacion -> adjudicada
CREATE OR REPLACE FUNCTION fn_validar_estado_contratacion()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.estado IS DISTINCT FROM OLD.estado THEN
            IF NOT (
                (OLD.estado = 'solicitud'  AND NEW.estado = 'cotizacion') OR
                (OLD.estado = 'cotizacion' AND NEW.estado = 'adjudicada')
            ) THEN
                RAISE EXCEPTION 'Cambio de estado no permitido en contrataciones: % -> %', OLD.estado, NEW.estado;
            END IF;
        END IF;
    END IF;

    -- Las fechas de cada etapa se completan solas si el usuario no las envia.
    IF NEW.estado = 'cotizacion' AND NEW.fecha_cotizacion IS NULL THEN
        NEW.fecha_cotizacion := GREATEST(CURRENT_DATE, NEW.fecha);
    END IF;

    IF NEW.estado = 'adjudicada' AND NEW.fecha_adjudicacion IS NULL THEN
        NEW.fecha_adjudicacion := GREATEST(CURRENT_DATE, NEW.fecha_cotizacion);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contrataciones_estado ON contrataciones;
CREATE TRIGGER trg_contrataciones_estado
    BEFORE INSERT OR UPDATE ON contrataciones
    FOR EACH ROW EXECUTE FUNCTION fn_validar_estado_contratacion();

-- ---------- 5. Los montos asignados no pueden superar lo programado ----------
-- Un trigger AFTER porque valida la suma de varias filas de la misma actividad.
CREATE OR REPLACE FUNCTION fn_validar_monto_propuesta()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    v_programado numeric;
    v_sumado     numeric;
BEGIN
    IF NEW.actividad_id IS NULL OR NEW.estado = 'propuesto' THEN
        RETURN NULL;
    END IF;

    SELECT a.monto_programado INTO v_programado
    FROM actividades a
    WHERE a.id = NEW.actividad_id;

    SELECT COALESCE(SUM(p.monto_asignado), 0) INTO v_sumado
    FROM propuestas_participativas p
    WHERE p.actividad_id = NEW.actividad_id
      AND p.estado IN ('aprobado','en_ejecucion','concluido')
      AND p.id <> NEW.id;

    IF (v_sumado + NEW.monto_asignado) > v_programado THEN
        RAISE EXCEPTION 'Los montos asignados a la actividad % no pueden superar lo programado: % Bs asignados de % Bs programados',
            NEW.actividad_id, (v_sumado + NEW.monto_asignado), v_programado;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_propuestas_monto ON propuestas_participativas;
CREATE TRIGGER trg_propuestas_monto
    AFTER INSERT OR UPDATE ON propuestas_participativas
    FOR EACH ROW EXECUTE FUNCTION fn_validar_monto_propuesta();
