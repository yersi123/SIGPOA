-- =====================================================
-- Run all  |  Gestión del POA
-- Ejecuta todos los scripts en orden.
--
-- 1) Crear la base de datos (una sola vez):
--      CREATE DATABASE "Gestión del POA" ENCODING 'UTF8';
-- 2) Desde esta carpeta:
--      psql -U postgres -d "Gestión del POA" -f "Run all.sql"
-- =====================================================

\set ON_ERROR_STOP on
\encoding UTF8

\ir '00 extensions functions.sql'
\ir '01 tables.sql'
\ir '02 unique constraints.sql'
\ir '03 foreign keys.sql'
\ir '04 check constraints.sql'
\ir '05 indexes.sql'
\ir '06 triggers.sql'
\ir '07 seed data.sql'
\ir '08 reglas negocio y comentarios.sql'
\ir '09 procedimientos almacenados.sql'
\ir '10 crud basico.sql'
