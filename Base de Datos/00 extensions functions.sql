-- =====================================================
-- 00 extensions functions  |  SIGPOA
-- Extensiones y funciones auxiliares
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- crypt() / gen_salt() para contraseñas bcrypt

-- Actualiza automáticamente la columna updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- Porcentaje seguro (evita división por cero)
CREATE OR REPLACE FUNCTION fn_porcentaje(p_parte numeric, p_total numeric)
RETURNS numeric
LANGUAGE sql IMMUTABLE AS $$
    SELECT COALESCE(ROUND(100 * p_parte / NULLIF(p_total, 0), 2), 0);
$$;
