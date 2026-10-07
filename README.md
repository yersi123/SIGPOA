# SIGPOA — Sistema de Información Web para la Gestión del POA

Sistema web para la planificación, seguimiento y fiscalización del **Plan Operativo Anual (POA)** de entidades públicas. Permite gestionar el ciclo completo del POA: entidades, unidades organizacionales, partidas presupuestarias, actividades, gastos, proveedores, contrataciones, propuestas participativas y reportes de ejecución.

## Objetivo y problema que resuelve

En muchas entidades la gestión del POA se realiza en hojas de cálculo dispersas, sin control presupuestario centralizado, sin trazabilidad de la ejecución ni mecanismos de control social. **SIGPOA** centraliza esa información en una sola plataforma con base de datos relacional, control de acceso por roles y reglas de negocio implementadas en el motor de base de datos, permitiendo conocer la ejecución presupuestaria real y facilitando la transparencia y el control social.

## Funcionalidades principales

- **Autenticación con token** (Laravel Sanctum): login, logout y consulta de la sesión activa (`/api/auth/*`). El login es la única ruta pública.
- **Dashboard** de solo lectura: resumen general, ejecución por unidad, ejecución por organización y alertas.
- **Gestión del POA**: gestión anual (`gestiones`) con **cierre de gestión** exclusivo del administrador.
- **Entidades** y **Unidades** organizacionales.
- **Partidas presupuestarias**.
- **Actividades** del POA y su ejecución presupuestaria.
- **Gastos** por actividad (registro mediante procedimiento almacenado).
- **Proveedores**.
- **Contrataciones** con cambios de estado y **adjudicación** mediante procedimiento almacenado.
- **Organizaciones sociales**.
- **Propuestas participativas** con flujo de estados.
- **Reportes** de ejecución y por organizaciones en **PDF** (Dompdf) y **Excel** (Maatwebsite).
- **Reglas de negocio en base de datos**: 3 vistas, 6 funciones, 4 procedimientos y 16 triggers que garantizan la integridad de la ejecución presupuestaria.

### Roles de usuario

| Rol | Descripción |
|---|---|
| `administrador` | Acceso total al sistema. Función exclusiva: **cerrar gestión**. |
| `responsable` | Gestiona el POA y la ejecución de su unidad. |
| `control_social` | Consulta y fiscalización en **modo lectura**. |

El detalle de la regla R8 (qué puede hacer cada rol, recurso por recurso) está en [`Documentacion/MATRIZ-ROLES.md`](Documentacion/MATRIZ-ROLES.md).

## Stack tecnológico

**Frontend**

- React 19.2 · TypeScript ~6.0 · Vite ~8.3
- Tailwind CSS ~4.3 · Radix UI · lucide-react · tw-animate-css
- React Router 7 · TanStack Query 5 · Zustand 5 · React Hook Form + Zod · Axios · Recharts

**Backend**

- PHP ^8.2 (probado con 8.2.12) · Laravel ^12.0 (probado con 12.69.2)
- Laravel Sanctum ^4.0 (autenticación por token)
- barryvdh/laravel-dompdf ^3.1 (generación de PDF) · maatwebsite/excel ^3.1 (generación de Excel)

**Base de datos**

- PostgreSQL 18 (probado con 18.3) · Base de datos `Gestión del POA`
- Sin migraciones de Laravel: el esquema y los datos se cargan con scripts SQL.

**Herramientas**

- Composer 2.9 · npm 11 · oxlint · PHPUnit 11 · Postman

## Arquitectura y estructura de carpetas

Arquitectura **cliente-servidor** desacoplada: una SPA (React) consume una **API REST** (Laravel) autenticada por token, sobre PostgreSQL.

```
Sistema de Información Web para la Gestión del POA/
├── backend/                        # API REST (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Controladores de la API
│   │   ├── Http/Middleware/        # RolMiddleware, FuerzaJson
│   │   └── Models/                 # Modelos Eloquent (Actividad, Gasto, ...)
│   ├── routes/api.php              # Definición de rutas /api
│   └── config/, database/, tests/
├── frontend/                       # SPA (React + Vite + TypeScript)
│   └── src/
│       ├── components/             # UI, componentes comunes y por módulo
│       ├── pages/                  # Vistas por módulo
│       ├── hooks/, stores/, router/, types/, lib/
├── Base de Datos/                  # Scripts SQL (esquema, triggers, seed)
│   └── Run all.sql                 # Ejecuta todo el script en orden
├── Tareas Backend/                 # Checklist de tareas + colección Postman
├── Tareas Frontend/                # Checklist de tareas
├── SIGPOA.postman_collection.json
└── README.md
```

## Modelo de datos

Base de datos **`Gestión del POA`** (PostgreSQL). Tablas principales:

| Tabla | Propósito |
|---|---|
| `roles` | Roles del sistema (`administrador`, `responsable`, `control_social`). |
| `entidades` | Entidades públicas (tipo, departamento, municipio). |
| `unidades` | Unidades organizacionales por entidad. |
| `usuarios` | Usuarios con rol y unidad asignada. |
| `gestiones` | Periodos anuales del POA (con estado/cierre). |
| `partidas` | Partidas presupuestarias. |
| `organizaciones` | Organizaciones sociales. |
| `proveedores` | Proveedores. |
| `actividades` | Actividades del POA. |
| `gastos` | Gastos asociados a actividades. |
| `contrataciones` | Contrataciones y su adjudicación. |
| `propuestas_participativas` | Propuestas de participación ciudadana. |

**Objetos de lógica de negocio**

- **Vistas**: `v_ejecucion_actividad`, `v_ejecucion_unidad`, `v_ejecucion_organizacion`.
- **Funciones**: `fn_resumen_dashboard`, `fn_ejecucion_por_unidad`, `fn_ejecucion_por_organizacion`, `fn_actividades_sobreejecutadas`.
- **Procedimientos**: `sp_registrar_gasto`, `sp_cambiar_estado_propuesta`, `sp_adjudicar_contratacion`, `sp_cerrar_gestion`.

> El detalle del esquema (tablas, restricciones, índices, triggers, procedimientos y datos semilla) está en la carpeta `Base de Datos/`.

## Requisitos previos

- PHP ≥ 8.2 con las extensiones requeridas por Laravel (pdo_pgsql, mbstring, etc.)
- Composer ≥ 2.9
- Node.js ≥ 20 y npm
- PostgreSQL ≥ 16 (probado con PostgreSQL 18)

## Instalación y ejecución

### 1) Base de datos

Crear la base `Gestión del POA` en PostgreSQL y ejecutar, en orden, los scripts de `Base de Datos/` (o directamente `Run all.sql`):

```bash
psql -U postgres -d "Gestión del POA" -f "Base de Datos/Run all.sql"
```

### 2) Backend — API en `http://127.0.0.1:8123`

```bash
cd backend
composer install
copy .env.example .env          # Windows  (o: cp .env.example .env)
php artisan key:generate
# Ajustar en .env: DB_DATABASE="Gestión del POA", DB_USERNAME, DB_PASSWORD
php artisan serve --port=8123
```

**Variables de entorno de ejemplo** (`backend/.env`):

```
APP_ENV=local
APP_URL=http://localhost
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE="Gestión del POA"
DB_USERNAME=postgres
DB_PASSWORD=
```

### 3) Frontend — `http://localhost:5173`

```bash
cd frontend
npm install
npm run dev
```

**Variables de entorno de ejemplo** (`frontend/.env.local`):

```
VITE_API_BASE_URL=http://127.0.0.1:8123/api
```

La API se sirve en `http://127.0.0.1:8123/api` y la SPA en `http://localhost:5173`.

## Documentación de la API

La colección Postman **`SIGPOA.postman_collection.json`** (disponible en la raíz y en `Tareas Backend/`) documenta todos los endpoints del sistema: autenticación, dashboard, gestiones, entidades, unidades, partidas, actividades, gastos, proveedores, contrataciones, organizaciones, propuestas y reportes.

## Autores y universidad

- **Universidad Autónoma Gabriel René Moreno (UAGRM)**
- **Materia:** Ingeniería de Software 1
- **Autor:** Boris Vásquez

## Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.