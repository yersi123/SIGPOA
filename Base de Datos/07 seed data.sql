-- =====================================================
-- 07 seed data  |  SIGPOA
-- Datos de ejemplo para la demostración
-- Usuarios de prueba:
--   admin@sigpoa.bo        / Admin123*     (administrador)
--   responsable@sigpoa.bo  / Resp123*      (responsable de unidad)
--   control@sigpoa.bo      / Control123*   (control social)
-- =====================================================

INSERT INTO roles (id, nombre, descripcion) VALUES
 (1, 'administrador',  'Acceso total al sistema'),
 (2, 'responsable',    'Gestiona el POA y la ejecución de su unidad'),
 (3, 'control_social', 'Consulta y fiscalización en modo lectura');

INSERT INTO entidades (id, nombre, tipo, departamento, municipio) VALUES
 (1, 'Gobierno Autónomo Municipal Demo', 'municipio', 'Santa Cruz', 'Camiri');

INSERT INTO unidades (id, entidad_id, nombre, responsable) VALUES
 (1, 1, 'Secretaría de Obras Públicas',            'Ing. Carlos Rojas'),
 (2, 1, 'Secretaría de Desarrollo Humano',         'Lic. María Flores'),
 (3, 1, 'Secretaría de Administración y Finanzas', 'Lic. Jorge Mamani');

INSERT INTO usuarios (id, nombre, email, password_hash, rol_id, unidad_id) VALUES
 (1, 'Administrador del Sistema', 'admin@sigpoa.bo',       crypt('Admin123*',   gen_salt('bf', 12)), 1, 3),
 (2, 'Responsable de Obras',      'responsable@sigpoa.bo', crypt('Resp123*',    gen_salt('bf', 12)), 2, 1),
 (3, 'Representante Control Social','control@sigpoa.bo',    crypt('Control123*', gen_salt('bf', 12)), 3, NULL);

INSERT INTO gestiones (id, anio, estado) VALUES
 (1, 2025, 'cerrada'),
 (2, 2026, 'abierta');

INSERT INTO partidas (id, codigo, nombre) VALUES
 (1, '25100', 'Consultorías por producto'),
 (2, '31100', 'Alimentos y bebidas para personas'),
 (3, '34100', 'Combustibles y lubricantes'),
 (4, '42200', 'Construcciones y mejoras de bienes públicos'),
 (5, '43100', 'Equipo de oficina y computación');

INSERT INTO organizaciones (id, nombre, tipo, personeria_juridica, representante, telefono, direccion) VALUES
 (1, 'OTB Barrio Central',            'OTB',             'RES-ADM-001/2020', 'Juan Pérez',     '70000001', 'Calle Comercio s/n'),
 (2, 'Junta Vecinal Villa Esperanza', 'junta_vecinal',   'RES-ADM-014/2019', 'Rosa Vargas',    '70000002', 'Av. Esperanza 120'),
 (3, 'Sindicato de Transporte Libertad','sindicato',     'RES-MG-087/2018',  'Luis Condori',   '70000003', 'Terminal de buses'),
 (4, 'Capitanía Guaraní Zona Norte',  'pueblo_indigena', 'RES-ADM-022/2021', 'Mario Cuéllar',  '70000004', 'Comunidad Zona Norte');

INSERT INTO proveedores (id, nombre, nit, telefono, direccion) VALUES
 (1, 'Constructora Andina S.R.L.', '1023456019', '3-5220001', 'Av. Petrolera 450'),
 (2, 'Distribuidora El Chaco',     '2034567012', '3-5220002', 'Calle Bolívar 78'),
 (3, 'TecnoSistemas Bolivia',      '3045678013', '3-5220003', 'Av. Busch 300');

INSERT INTO actividades (id, gestion_id, unidad_id, partida_id, organizacion_id, objetivo, meta, descripcion, monto_programado) VALUES
 (1, 2, 1, 4, 1,    'Construcción de cancha polifuncional',   '1 cancha construida',      'Obra en la zona central',            150000),
 (2, 2, 1, 4, 2,    'Mejoramiento de calles Villa Esperanza', '2 km de calles mejoradas', 'Empedrado y drenaje pluvial',        200000),
 (3, 2, 2, 1, NULL, 'Capacitación a organizaciones sociales', '10 talleres realizados',   'Talleres de control social',          30000),
 (4, 2, 2, 2, 4,    'Alimentación complementaria escolar',    '300 estudiantes atendidos','Desayuno escolar zona norte',         60000),
 (5, 2, 3, 5, NULL, 'Equipamiento informático municipal',     '20 equipos adquiridos',    'Renovación de computadoras',          45000);

INSERT INTO gastos (id, actividad_id, proveedor_id, fecha, monto, detalle, registrado_por) VALUES
 (1, 1, 1, '2026-03-10', 45000, 'Anticipo de obra',                  2),
 (2, 1, 1, '2026-05-20', 38000, 'Segundo desembolso de obra',        2),
 (3, 2, 1, '2026-04-15', 80000, 'Materiales y mano de obra',         2),
 (4, 3, NULL, '2026-06-01', 12000, 'Honorarios de capacitadores',    1),
 (5, 4, 2, '2026-02-20', 25000, 'Primera entrega de alimentos',      1),
 (6, 4, 2, '2026-07-10', 20000, 'Segunda entrega de alimentos',      1),
 (7, 5, 3, '2026-03-05', 30000, 'Compra de 12 computadoras',         1),
 (8, 5, 3, '2026-08-12', 18000, 'Compra de 8 computadoras (excede lo programado)', 1);

INSERT INTO contrataciones (id, actividad_id, proveedor_id, descripcion, monto_cotizado, estado, fecha, fecha_cotizacion, fecha_adjudicacion) VALUES
 (1, 2, 1, 'Provisión de materiales de construcción', 90000, 'adjudicada', '2026-03-10', '2026-03-15', '2026-03-20'),
 (2, 4, 2, 'Provisión de alimentos para el desayuno escolar', 60000, 'cotizacion', '2026-05-02', '2026-05-02', NULL),
 (3, 5, 3, 'Ampliación de equipos informáticos',      12000, 'solicitud',  '2026-09-01', NULL,            NULL);

INSERT INTO propuestas_participativas (id, organizacion_id, gestion_id, actividad_id, titulo, descripcion, monto_asignado, estado) VALUES
 (1, 1, 2, 1,    'Cancha polifuncional zona central',   'Espacio deportivo para jóvenes del barrio', 150000, 'en_ejecucion'),
 (2, 2, 2, 2,    'Mejoramiento de calles Villa Esperanza','Empedrado y drenaje',                      200000, 'aprobado'),
 (3, 3, 2, NULL, 'Capacitación en seguridad vial',      'Talleres para choferes del sindicato',            0, 'propuesto'),
 (4, 4, 2, 4,    'Alimentación complementaria escolar', 'Desayuno escolar zona norte',                 60000, 'concluido');

-- Ajusta las secuencias después de insertar IDs explícitos
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'roles','entidades','unidades','usuarios','gestiones','partidas',
        'organizaciones','proveedores','actividades','gastos',
        'contrataciones','propuestas_participativas'
    ] LOOP
        EXECUTE format(
            'SELECT setval(pg_get_serial_sequence(%L, ''id''), (SELECT COALESCE(MAX(id),1) FROM %I))', t, t);
    END LOOP;
END $$;
