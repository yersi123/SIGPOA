-- =====================================================
-- 05 indexes  |  SIGPOA
-- Índices sobre claves foráneas y columnas de consulta frecuente
-- (las columnas UNIQUE ya tienen su índice)
-- =====================================================

CREATE INDEX idx_unidades_entidad          ON unidades (entidad_id);

CREATE INDEX idx_usuarios_rol              ON usuarios (rol_id);
CREATE INDEX idx_usuarios_unidad           ON usuarios (unidad_id);

CREATE INDEX idx_actividades_gestion       ON actividades (gestion_id);
CREATE INDEX idx_actividades_unidad        ON actividades (unidad_id);
CREATE INDEX idx_actividades_partida       ON actividades (partida_id);
CREATE INDEX idx_actividades_organizacion  ON actividades (organizacion_id);

CREATE INDEX idx_gastos_actividad          ON gastos (actividad_id);
CREATE INDEX idx_gastos_proveedor          ON gastos (proveedor_id);
CREATE INDEX idx_gastos_fecha              ON gastos (fecha);

CREATE INDEX idx_contrataciones_actividad  ON contrataciones (actividad_id);
CREATE INDEX idx_contrataciones_proveedor  ON contrataciones (proveedor_id);
CREATE INDEX idx_contrataciones_estado     ON contrataciones (estado);

CREATE INDEX idx_propuestas_organizacion   ON propuestas_participativas (organizacion_id);
CREATE INDEX idx_propuestas_gestion        ON propuestas_participativas (gestion_id);
CREATE INDEX idx_propuestas_actividad      ON propuestas_participativas (actividad_id);
CREATE INDEX idx_propuestas_estado         ON propuestas_participativas (estado);

CREATE INDEX idx_organizaciones_tipo       ON organizaciones (tipo);
