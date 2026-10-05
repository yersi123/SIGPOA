-- =====================================================
-- 02 unique constraints  |  SIGPOA
-- =====================================================

ALTER TABLE roles          ADD CONSTRAINT uq_roles_nombre            UNIQUE (nombre);
ALTER TABLE entidades      ADD CONSTRAINT uq_entidades_nombre        UNIQUE (nombre);
ALTER TABLE unidades       ADD CONSTRAINT uq_unidades_entidad_nombre UNIQUE (entidad_id, nombre);
ALTER TABLE usuarios       ADD CONSTRAINT uq_usuarios_email          UNIQUE (email);
ALTER TABLE gestiones      ADD CONSTRAINT uq_gestiones_anio          UNIQUE (anio);
ALTER TABLE partidas       ADD CONSTRAINT uq_partidas_codigo         UNIQUE (codigo);
ALTER TABLE organizaciones ADD CONSTRAINT uq_organizaciones_personeria UNIQUE (personeria_juridica);
ALTER TABLE proveedores    ADD CONSTRAINT uq_proveedores_nit         UNIQUE (nit);
