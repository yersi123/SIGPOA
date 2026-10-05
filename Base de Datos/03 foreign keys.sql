-- =====================================================
-- 03 foreign keys  |  SIGPOA
-- =====================================================

-- Estructura institucional
ALTER TABLE unidades ADD CONSTRAINT fk_unidades_entidad
    FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE CASCADE;

-- Seguridad
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_unidad
    FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE SET NULL;

-- Planificación (POA)
ALTER TABLE actividades ADD CONSTRAINT fk_actividades_gestion
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT;
ALTER TABLE actividades ADD CONSTRAINT fk_actividades_unidad
    FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE RESTRICT;
ALTER TABLE actividades ADD CONSTRAINT fk_actividades_partida
    FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE RESTRICT;
ALTER TABLE actividades ADD CONSTRAINT fk_actividades_organizacion
    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id) ON DELETE SET NULL;

-- Ejecución presupuestaria
ALTER TABLE gastos ADD CONSTRAINT fk_gastos_actividad
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE RESTRICT;
ALTER TABLE gastos ADD CONSTRAINT fk_gastos_proveedor
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT;
ALTER TABLE gastos ADD CONSTRAINT fk_gastos_usuario
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE RESTRICT;

-- Contrataciones
ALTER TABLE contrataciones ADD CONSTRAINT fk_contrataciones_actividad
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE RESTRICT;
ALTER TABLE contrataciones ADD CONSTRAINT fk_contrataciones_proveedor
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT;

-- Presupuesto participativo
ALTER TABLE propuestas_participativas ADD CONSTRAINT fk_propuestas_organizacion
    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id) ON DELETE RESTRICT;
ALTER TABLE propuestas_participativas ADD CONSTRAINT fk_propuestas_gestion
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT;
ALTER TABLE propuestas_participativas ADD CONSTRAINT fk_propuestas_actividad
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE SET NULL;
