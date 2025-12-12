# Arquitectura del Sistema de Gestión de Tareas

## Visión General

Sistema de gestión de tareas desarrollado con:
- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend:** PHP (API REST) con arquitectura MVC + JWT
- **Base de datos:** MySQL

---

## Componentes del Sistema

### Frontend: Next.js (React) + Tailwind CSS

- Pantallas: login, dashboard, lista de tareas, detalle de tarea, administración, reportes
- Diseño moderno y responsivo usando Tailwind CSS
- Consume una API REST hecha en PHP con autenticación JWT

### Backend: PHP (solo API, sin vistas)

- Arquitectura MVC con Front Controller
- Autenticación JWT (Access Token + Refresh Token)
- Endpoints REST bajo `/api/v1`
- Middlewares para seguridad y validación

### Base de datos: MySQL

- Tablas para: usuarios, roles, áreas/proyectos, tareas, comentarios, refresh tokens

---

## Flujo del Sistema

1. Usuario entra a `https://intranet-empresa/....`
2. Next.js muestra pantalla de login → envía correo y contraseña al backend PHP
3. PHP valida credenciales, genera JWT (access + refresh token), responde con `access_token`
4. Next.js guarda `access_token` en memoria (React state) y redirige al dashboard
5. Todas las peticiones siguientes incluyen `Authorization: Bearer <access_token>`
6. El backend PHP:
   - Valida el JWT en cada request
   - Aplica reglas de rol:
     - **Admin** → ven todo, pueden editar áreas y usuarios del sistema
     - **Gerencia** → ven todo, acceso a dashboard gerencial con reportes consolidados
     - **Líder de área** → ve todo lo de su área, acceso a dashboard de reportes diarios de su área
     - **Colaborador** → ve solo sus tareas
7. Cuando expira el access token, el frontend renueva automáticamente usando el refresh token

---

# Modelo de Datos (MySQL)

## Tablas Base

### Tabla: roles

```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,      -- admin, gerencia, lider_area, colaborador
  description VARCHAR(255)
);
```

### Tabla: areas

```sql
CREATE TABLE areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,            -- IT, ADMINISTRACIÓN, HSEQ...
  code VARCHAR(50) NOT NULL UNIQUE,      -- IT, ADMIN, HSEQ, etc.
  type ENUM('AREA','PROYECTO') DEFAULT 'AREA'
);
```

### Tabla: users

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  area_id INT NULL,                      -- área principal del usuario
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (area_id) REFERENCES areas(id)
);
```

## Tareas y Comentarios

### Tabla: tasks

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('Clave','Operativa','Mejora','Obligatoria') DEFAULT 'Operativa',
  priority ENUM('Alta','Media','Baja') DEFAULT 'Media',
  status ENUM('No iniciada','En progreso','En revisión','Completada','En riesgo')
         DEFAULT 'No iniciada',
  progress_percent TINYINT UNSIGNED DEFAULT 0, -- 0–100
  responsible_id INT NOT NULL,                 -- usuario responsable
  created_by INT NOT NULL,                     -- quién creó la tarea
  start_date DATE NULL,
  due_date DATE NULL,
  closed_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (area_id) REFERENCES areas(id),
  FOREIGN KEY (responsible_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (area_id),
  INDEX (responsible_id),
  INDEX (status),
  INDEX (due_date),
  INDEX (updated_at)
);
```

### Tabla: task_comments

```sql
CREATE TABLE task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tabla: refresh_tokens

```sql
CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id),
  INDEX (expires_at)
);
```

---

# Backend PHP (API) — Arquitectura MVC + JWT

> **Nota (API-first):** en un backend REST no hay "vistas" HTML; la capa **View** se implementa como **Serializadores/Resources** que transforman modelos en **JSON** (DTOs).

## Objetivo

Estandarizar el backend (solo API) bajo un patrón **MVC** con:
- **Routing centralizado** (Front Controller)
- **Controladores** por recurso (Auth, Tasks, Users, Areas, Reports)
- **Servicios** para lógica de negocio
- **Repositorios/Modelos** para persistencia (MySQL / PDO)
- **Middlewares** (JWT, roles, validación)
- **Autenticación JWT** con **Access Token** + **Refresh Token**

## Estructura de Carpetas

```
backend/
  public/
    index.php               # Front Controller (único punto de entrada)
    .htaccess               # (Apache) redirect todo a index.php

  src/
    Config/
      config.php            # carga de env, constantes, settings
      routes.php            # definición de rutas
      container.php         # DI simple (opcional)

    Core/
      Router.php            # router (match + dispatch)
      Request.php           # wrapper request (method, body, query, headers)
      Response.php          # helpers JSON, status codes
      ExceptionHandler.php  # manejo centralizado de errores
      Validator.php         # validación básica (rules)
      Database.php          # PDO singleton / factory
      Logger.php            # logging (opcional)

    Middleware/
      CorsMiddleware.php
      JwtAuthMiddleware.php
      RoleMiddleware.php
      RateLimitMiddleware.php  # opcional (login)

    Controllers/
      AuthController.php
      TaskController.php
      AreaController.php
      UserController.php
      ReportController.php

    Services/
      AuthService.php
      JwtService.php
      TaskService.php
      UserService.php
      AreaService.php
      ReportService.php

    Models/                 # entidades + mapeo simple
      User.php
      Role.php
      Area.php
      Task.php
      TaskComment.php
      RefreshToken.php

    Repositories/           # acceso a datos (SQL)
      UserRepository.php
      RoleRepository.php
      AreaRepository.php
      TaskRepository.php
      TaskCommentRepository.php
      RefreshTokenRepository.php

    Resources/              # "View": JSON DTO/transformers
      UserResource.php
      TaskResource.php
      AreaResource.php
      ReportResource.php
      ErrorResource.php

  storage/
    logs/app.log

  migrations/
    001_create_tables.sql

  vendor/                   # composer
  composer.json
  .env
  .env.example
```

## Dependencias Recomendadas (Composer)

- `firebase/php-jwt` (firma/verificación JWT)
- `vlucas/phpdotenv` (variables de entorno)
- (Opcional) `monolog/monolog` (logging)

## Convenciones de API

- Base path: `/api/v1`
- Respuestas JSON consistentes:
  - **Éxito:** `{ "data": ... }`
  - **Error:** `{ "error": { "code": "...", "message": "...", "details": ... } }`
- Autorización: header `Authorization: Bearer <access_token>`
- Tokens:
  - **Access token:** 15 min (ejemplo)
  - **Refresh token:** 7–30 días (ejemplo)

## Autenticación JWT (Access + Refresh)

### Flujo

1. **POST** `/api/v1/auth/login` con `email`, `password`
2. Si OK:
   - Devuelve `access_token` (JSON)
   - Devuelve `refresh_token` preferiblemente en **cookie HttpOnly** (recomendado) o en JSON si no hay opción
3. Front usa `access_token` en `Authorization: Bearer ...`
4. Cuando expira el access token:
   - **POST** `/api/v1/auth/refresh` (envía refresh token por cookie o body)
   - Devuelve un nuevo `access_token`
5. Logout:
   - **POST** `/api/v1/auth/logout` revoca el refresh token en BD

### Claims Sugeridos (Access Token)

- `sub`: user_id
- `role`: nombre del rol (admin/gerencia/lider_area/colaborador)
- `area_id`: área principal (si aplica)
- `iat`, `exp`
- `jti`: id único del token (opcional, útil para auditoría)

### Seguridad Recomendada

- Firmar con **RS256** (ideal) o **HS256** (más simple)
- Guardar `JWT_PRIVATE_KEY / JWT_PUBLIC_KEY` o `JWT_SECRET` en `.env`
- Si usas Refresh Token:
  - Guardarlo **hasheado** en BD (igual que contraseñas)
  - Guardarlo en cookie **HttpOnly + Secure + SameSite=Lax/Strict**

## Routing (Front Controller)

### `public/index.php` (idea general)

```php
<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Core\ExceptionHandler;

ExceptionHandler::register();

$request = Request::fromGlobals();
$router  = new Router(require __DIR__ . '/../src/Config/routes.php');

$router->dispatch($request)->send();
```

### `src/Config/routes.php` (ejemplo)

```php
<?php
use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\UserController;
use App\Controllers\AreaController;
use App\Controllers\ReportController;
use App\Middleware\CorsMiddleware;
use App\Middleware\JwtAuthMiddleware;
use App\Middleware\RoleMiddleware;

return [
  // Global middleware
  'middleware' => [
    CorsMiddleware::class,
  ],

  // Rutas públicas
  'routes' => [
    ['POST', '/api/v1/auth/login',   [AuthController::class, 'login']],
    ['POST', '/api/v1/auth/refresh', [AuthController::class, 'refresh']],
  ],

  // Rutas protegidas
  'protected' => [
    'middleware' => [
      JwtAuthMiddleware::class,
    ],
    'routes' => [
      ['GET',  '/api/v1/auth/me',     [AuthController::class, 'me']],
      ['POST', '/api/v1/auth/logout', [AuthController::class, 'logout']],

      // Tasks
      ['GET',    '/api/v1/tasks',           [TaskController::class, 'index']],
      ['POST',   '/api/v1/tasks',           [TaskController::class, 'store']],
      ['GET',    '/api/v1/tasks/{id}',      [TaskController::class, 'show']],
      ['PUT',    '/api/v1/tasks/{id}',      [TaskController::class, 'update']],
      ['DELETE', '/api/v1/tasks/{id}',      [TaskController::class, 'destroy']],

      // Admin
      ['GET',  '/api/v1/areas', [AreaController::class, 'index'],  [RoleMiddleware::class => ['admin']]],
      ['POST', '/api/v1/areas', [AreaController::class, 'store'],  [RoleMiddleware::class => ['admin']]],
      ['PUT',  '/api/v1/areas/{id}', [AreaController::class, 'update'], [RoleMiddleware::class => ['admin']]],

      ['GET',  '/api/v1/users', [UserController::class, 'index'],  [RoleMiddleware::class => ['admin']]],
      ['POST', '/api/v1/users', [UserController::class, 'store'],  [RoleMiddleware::class => ['admin']]],
      ['PUT',  '/api/v1/users/{id}', [UserController::class, 'update'], [RoleMiddleware::class => ['admin']]],

      // Reports
      ['GET', '/api/v1/reports/daily',      [ReportController::class, 'daily']],
      ['GET', '/api/v1/reports/management', [ReportController::class, 'management'], [RoleMiddleware::class => ['admin','gerencia']]],
    ],
  ],
];
```

## Capas del MVC (Responsabilidades)

### Controllers (HTTP)

- Parsean request, validan input, llaman servicios
- No contienen SQL directo
- Responden usando `Response::json(...)` + Resources

Ejemplo: `TaskController@index`
- lee filtros (status, area_id, responsible_id, fechas)
- llama `TaskService->list($userContext, $filters)`
- retorna `TaskResource::collection($tasks)`

### Services (Reglas de Negocio)

- Implementan permisos de rol y reglas:
  - Admin/Gerencia ven todo
  - Líder ve su área
  - Colaborador ve solo sus tareas
- Orquestan repositorios

### Repositories/Models (Persistencia)

- SQL y mapeo a entidades
- PDO preparado, paginación, orden, índices

### Resources (View JSON)

- Normalizan el shape de respuesta:
  - omitir `password_hash`
  - formateo de fechas
  - campos derivados (por ejemplo `is_overdue`)

## Middlewares (Seguridad y Consistencia)

### `JwtAuthMiddleware`

- Lee `Authorization: Bearer <token>`
- Verifica firma + expiración
- Adjunta `userContext` al request (id, role, area_id)

### `RoleMiddleware`

- Bloquea si `role` no está en la lista permitida

### `CorsMiddleware`

- Controla `Access-Control-Allow-Origin`, `Allow-Headers`, `Allow-Methods`
- Responde preflight `OPTIONS` con 204

### (Opcional) `RateLimitMiddleware` para login

- Evita fuerza bruta (p.ej. 10 intentos / 5 min por IP)

## Endpoints (Resumen)

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

### Tasks

- `GET /api/v1/tasks` (filtros + paginación)
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/{id}`
- `PUT /api/v1/tasks/{id}`
- `DELETE /api/v1/tasks/{id}` (o soft delete)

### Admin

- `GET/POST/PUT /api/v1/areas...` (solo admin)
- `GET/POST/PUT /api/v1/users...` (solo admin)

### Reports

- `GET /api/v1/reports/daily?date=YYYY-MM-DD&area_id=...`
- `GET /api/v1/reports/management?date=YYYY-MM-DD`

## Reglas de Permisos (RBAC) — Recomendación

Centralizar en `TaskService` (y equivalentes):
- **admin, gerencia**: acceso global
- **lider_area**: restringido por `area_id` del token
- **colaborador**: restringido por `responsible_id = sub`

> Importante: **validar en backend** que `area_id`/`responsible_id` enviados no violen permisos.

## Configuración (.env ejemplo)

```
APP_ENV=prod
APP_DEBUG=false

DB_HOST=localhost
DB_NAME=gestion_tareas
DB_USER=...
DB_PASS=...

JWT_ALG=HS256
JWT_SECRET=super_secret_change_me
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=14

CORS_ORIGIN=https://intranet-empresa
```

## Checklist Mínimo "Listo para Producción"

- Passwords: `password_hash()` / `password_verify()`
- JWT:
  - expiración corta (access)
  - refresh tokens revocables (BD)
  - rotación de refresh (opcional, recomendado)
- Validación: campos obligatorios + rangos + enums
- Logs: errores 500 al log, no al cliente
- DB: índices para `tasks(area_id,responsible_id,status,due_date,updated_at)`
- Paginación en listados para gerencia/admin

---

# Frontend con Next.js (React) + Tailwind CSS

Asumamos Next.js usando el router clásico de `pages/` (para no liar mucho):

## Estructura Básica

```
pages/
  login.js
  dashboard.js
  admin/
    areas.js
    users.js
  reports/
    daily.js
    management.js
components/
  TaskList.js
  TaskForm.js
  Layout.js
  Sidebar.js
  StatsCard.js
  Chart.js
lib/
  api.js              # cliente API con manejo de JWT
  auth.js             # helpers de autenticación
```

## Configuración de Tailwind CSS

Instalar Tailwind CSS en el proyecto Next.js:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configurar `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

Configurar `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

En `.env.local` del proyecto Next:

```
NEXT_PUBLIC_API_URL=http://tu-servidor/api/v1
```

## Cliente API con Manejo de JWT

### `lib/api.js`

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

async function refreshToken() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // para cookie HttpOnly
    });
    
    if (!res.ok) {
      throw new Error('Refresh failed');
    }
    
    const data = await res.json();
    setAccessToken(data.data.access_token);
    return data.data.access_token;
  } catch (error) {
    clearAccessToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
}

export async function apiRequest(url, options = {}) {
  const token = getAccessToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };
  
  let res = await fetch(`${API_URL}${url}`, config);
  
  // Si 401, intentar refresh
  if (res.status === 401 && token) {
    try {
      const newToken = await refreshToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${url}`, config);
    } catch (error) {
      throw error;
    }
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Error desconocido' } }));
    throw new Error(error.error?.message || 'Error en la petición');
  }
  
  return res.json();
}
```

### `lib/auth.js`

```javascript
// lib/auth.js
import { setAccessToken, clearAccessToken } from './api';

export function login(accessToken) {
  setAccessToken(accessToken);
}

export function logout() {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
```

## Pantalla de Login – pages/login.js

```javascript
// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/auth';
import { apiRequest } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(data.data.access_token);
      router.push('/dashboard');
    } catch (e) {
      setError(e.message || 'Error de autenticación');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Iniciar sesión
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="usuario@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Dashboard / Listado de Tareas – pages/dashboard.js

```javascript
// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { apiRequest } from '../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function loadTasks() {
      try {
        const data = await apiRequest('/tasks');
        setTasks(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user]);

  const getPriorityColor = (priority) => {
    const colors = {
      'Alta': 'bg-red-100 text-red-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Baja': 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completada': 'bg-green-100 text-green-800',
      'En progreso': 'bg-blue-100 text-blue-800',
      'En revisión': 'bg-purple-100 text-purple-800',
      'En riesgo': 'bg-red-100 text-red-800',
      'No iniciada': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mis tareas</h1>
          {(user?.role === 'admin' || user?.role === 'gerencia' || user?.role === 'lider_area') && (
            <button
              onClick={() => router.push('/reports/daily')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Ver reportes
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.area_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {t.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.responsible_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${t.progress_percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{t.progress_percent}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.due_date || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

## Dashboard de Reportes Diarios por Área – pages/reports/daily.js

```javascript
// pages/reports/daily.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import { apiRequest } from '../../lib/api';

export default function DailyReports() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function loadReport() {
      try {
        const data = await apiRequest(`/reports/daily?date=${selectedDate}`);
        setReport(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [selectedDate, user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reporte diario de actividades</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {report?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total tareas"
              value={report.stats.total}
              icon="📋"
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={report.stats.completed}
              icon="✅"
              color="green"
            />
            <StatsCard
              title="En riesgo"
              value={report.stats.at_risk}
              icon="⚠️"
              color="red"
            />
            <StatsCard
              title="Progreso promedio"
              value={`${Math.round(report.stats.avg_progress || 0)}%`}
              icon="📊"
              color="purple"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Actividades del {new Date(selectedDate).toLocaleDateString('es-ES')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report?.tasks?.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.priority}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.progress_percent}%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.responsible_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

## Dashboard Gerencial – pages/reports/management.js

```javascript
// pages/reports/management.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import { apiRequest } from '../../lib/api';

export default function ManagementDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        if (!['admin', 'gerencia'].includes(data.data.role)) {
          router.push('/dashboard');
          return;
        }
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function loadDashboard() {
      try {
        const data = await apiRequest('/reports/management');
        setDashboard(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Gerencial</h1>

        {dashboard?.general && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total tareas"
              value={dashboard.general.total_tasks}
              icon="📋"
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={dashboard.general.completed}
              icon="✅"
              color="green"
            />
            <StatsCard
              title="En riesgo"
              value={dashboard.general.at_risk}
              icon="⚠️"
              color="red"
            />
            <StatsCard
              title="Vencidas"
              value={dashboard.general.overdue}
              icon="🔴"
              color="orange"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen por área</h2>
            <div className="space-y-4">
              {dashboard?.by_area?.map(area => (
                <div key={area.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{area.area_name}</h3>
                    <span className="text-sm text-gray-500">{area.total_tasks} tareas</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-green-600">✓ {area.completed}</span>
                    </div>
                    <div>
                      <span className="text-red-600">⚠ {area.at_risk}</span>
                    </div>
                    <div>
                      <span className="text-orange-600">🔴 {area.overdue}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${area.avg_progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(area.avg_progress || 0)}% promedio</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Distribución por tipo</h2>
            <div className="space-y-2">
              {dashboard?.by_type?.map(item => (
                <div key={item.type} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.type}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

## Componente Layout – components/Layout.js

```javascript
// components/Layout.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { apiRequest } from '../lib/api';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (router.pathname === '/login') {
      return;
    }
    
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
```

## Componente Sidebar – components/Sidebar.js

```javascript
// components/Sidebar.js
import { useRouter } from 'next/router';
import Link from 'next/link';
import { logout } from '../lib/auth';

export default function Sidebar({ user, isOpen, onToggle }) {
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  if (user?.role === 'admin' || user?.role === 'gerencia' || user?.role === 'lider_area') {
    menuItems.push({ href: '/reports/daily', label: 'Reportes diarios', icon: '📅' });
  }

  if (user?.role === 'admin' || user?.role === 'gerencia') {
    menuItems.push({ href: '/reports/management', label: 'Dashboard gerencial', icon: '📈' });
  }

  if (user?.role === 'admin') {
    menuItems.push(
      { href: '/admin/areas', label: 'Áreas', icon: '🏢' },
      { href: '/admin/users', label: 'Usuarios', icon: '👥' }
    );
  }

  async function handleLogout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error(e);
    } finally {
      logout();
    }
  }

  return (
    <aside className={`bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex justify-between items-center">
        {isOpen && <h2 className="text-xl font-bold">Gestión Tareas</h2>}
        <button onClick={onToggle} className="text-white hover:text-gray-300">
          {isOpen ? '←' : '→'}
        </button>
      </div>
      <nav className="mt-4">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 hover:bg-gray-700 transition ${
              router.pathname === item.href ? 'bg-gray-700 border-l-4 border-blue-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      {isOpen && user && (
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <p className="text-sm text-gray-300">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left text-sm text-gray-400 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}
```

## Componente StatsCard – components/StatsCard.js

```javascript
// components/StatsCard.js
export default function StatsCard({ title, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
```

---

# Integración Frontend-Backend con JWT

## Nota de Integración con Next.js

- Guardar `access_token` **en memoria** (React state) o en un store (no localStorage si puedes evitarlo)
- Renovar con `/auth/refresh` cuando recibas 401 por expiración
- Enviar `Authorization: Bearer <access_token>` en cada request
- Si el refresh token está en cookie HttpOnly, el refresh se hace con `credentials: 'include'`

---

# Mapeo con la Matriz Original

- Tus áreas (IT, ADMINISTRACIÓN, HSEQ, PROYECTO FRONTERA, CW, PETROSERVICIOS, CONTABILIDAD, GESTIÓN HUMANA, GERENCIA) van a la tabla `areas`
- Tus tipos de actividad (Clave, Operativa, Mejora, Obligatoria) están en el campo `type` de `tasks`
- Tus estados (No iniciada, En progreso, En revisión, Completada, En riesgo) están en `status`
- Tu % avance va en `progress_percent`
- La lógica de "vencida / próxima / vence esta semana" se puede replicar en el frontend o en otro endpoint de reporte

---

# Plan de Implementación

## Fase 1: Base de Datos

1. **Crear BD con las tablas:**
   - roles: admin, gerencia, lider_area, colaborador
   - áreas: tus 9 áreas/proyectos
   - un usuario admin y un par de usuarios de prueba

## Fase 2: Backend PHP

2. **Montar el backend PHP con arquitectura MVC + JWT:**
   - Configurar Composer y dependencias
   - Implementar Core (Router, Request, Response, Database)
   - Implementar Middlewares (CORS, JWT, Roles)
   - Implementar Controllers, Services, Repositories
   - Implementar Resources para serialización JSON
   - Configurar `.env` y rutas

## Fase 3: Frontend Next.js

3. **Crear proyecto Next.js:**
   - Instalar Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
   - Configurar `tailwind.config.js` y `styles/globals.css`
   - Configurar `NEXT_PUBLIC_API_URL` apuntando al backend
   - Implementar cliente API con manejo de JWT (`lib/api.js`, `lib/auth.js`)
   - Implementar `pages/login.js` y `pages/dashboard.js`
   - Implementar componentes reutilizables: `Layout.js`, `Sidebar.js`, `StatsCard.js`

## Fase 4: Funcionalidades de Administración

4. **Implementar CRUD de administración:**
   - `pages/admin/areas.js` → CRUD de áreas (solo admin)
   - `pages/admin/users.js` → CRUD de usuarios (solo admin)
   - Endpoints backend: `AreaController`, `UserController`

## Fase 5: Dashboards de Reportes

5. **Implementar dashboards:**
   - `pages/reports/daily.js` → Reporte diario por área (lider_area, admin, gerencia)
   - `pages/reports/management.js` → Dashboard gerencial consolidado (admin, gerencia)
   - Backend: `ReportController` con métodos `daily()` y `management()`

## Fase 6: Mejoras y Optimizaciones

6. **Iterar y mejorar:**
   - Agregar creación/edición de tareas en el front
   - Gráficos con Chart.js o Recharts para visualizaciones avanzadas
   - Mejoras de UX y validaciones
   - Paginación en listados grandes
   - Filtros avanzados
   - Notificaciones en tiempo real (opcional)

---

# Checklist de Seguridad

- [ ] Passwords: `password_hash()` / `password_verify()`
- [ ] JWT:
  - [ ] Expiración corta (access token: 15 min)
  - [ ] Refresh tokens revocables (BD)
  - [ ] Rotación de refresh (opcional, recomendado)
- [ ] Validación: campos obligatorios + rangos + enums
- [ ] Logs: errores 500 al log, no al cliente
- [ ] DB: índices para `tasks(area_id,responsible_id,status,due_date,updated_at)`
- [ ] Paginación en listados para gerencia/admin
- [ ] CORS configurado correctamente
- [ ] Rate limiting en endpoints de autenticación
- [ ] Validación de permisos en backend (nunca confiar solo en frontend)

---

# Plan de Ajustes Priorizado

Este plan identifica mejoras críticas para estabilidad, seguridad y valor gerencial, priorizadas por impacto y esfuerzo.

## 1. Arreglar el flujo de sesión (Impacto: Altísimo, Esfuerzo: Bajo)

**Problema actual:** Si el usuario refresca el navegador, se queda sin `access_token` (porque está en memoria) y lo puedes mandar a login aunque tenga refresh cookie.

**Ajustes concretos:**

### Frontend: `lib/api.js` (mejoras)

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken = null;
let refreshPromise = null; // Lock para evitar múltiples refreshes simultáneos

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  refreshPromise = null;
}

async function refreshToken() {
  // Si ya hay un refresh en curso, esperar a que termine
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // para cookie HttpOnly
      });
      
      if (!res.ok) {
        throw new Error('Refresh failed');
      }
      
      const data = await res.json();
      setAccessToken(data.data.access_token);
      return data.data.access_token;
    } catch (error) {
      clearAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Bootstrap: intenta obtener access token desde refresh cookie al iniciar
export async function bootstrapAuth() {
  try {
    const token = await refreshToken();
    return token;
  } catch (error) {
    // Si no hay refresh token válido, no hacer nada (usuario debe hacer login)
    return null;
  }
}

export async function apiRequest(url, options = {}) {
  const token = getAccessToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };
  
  let res = await fetch(`${API_URL}${url}`, config);
  
  // Si 401, intentar refresh (incluso si no hay token en memoria)
  if (res.status === 401) {
    try {
      const newToken = await refreshToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${url}`, config);
    } catch (error) {
      throw error;
    }
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Error desconocido' } }));
    throw new Error(error.error?.message || 'Error en la petición');
  }
  
  return res.json();
}
```

### Frontend: `components/Layout.js` (bootstrap)

```javascript
// components/Layout.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { apiRequest, bootstrapAuth } from '../lib/api';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (router.pathname === '/login') {
      setIsBootstrapping(false);
      return;
    }
    
    async function bootstrap() {
      try {
        // 1. Intentar obtener access token desde refresh cookie
        await bootstrapAuth();
        
        // 2. Obtener información del usuario
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      } finally {
        setIsBootstrapping(false);
      }
    }
    
    bootstrap();
  }, [router]);

  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  if (isBootstrapping) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
```

**Resultado:** Sesión estable y cero frustración de usuario (clave para adopción).

---

## 2. Proteger refresh con cookie (CSRF / Origin check) (Impacto: Alto, Esfuerzo: Bajo)

**Problema:** Si el refresh token va en cookie (lo recomendado), necesitas defensa contra CSRF en `/auth/refresh` y `/auth/logout`.

**Ajustes concretos (elegir 1 o combinar):**

### Opción A: Validar Origin/Referer (más simple)

**Backend: `src/Middleware/CsrfMiddleware.php`**

```php
<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class CsrfMiddleware {
  private $allowedOrigins;

  public function __construct() {
    $this->allowedOrigins = [
      getenv('CORS_ORIGIN'), // https://intranet-empresa
    ];
  }

  public function handle(Request $request, callable $next) {
    // Solo aplicar a refresh y logout
    if (!in_array($request->getPath(), ['/api/v1/auth/refresh', '/api/v1/auth/logout'])) {
      return $next($request);
    }

    $origin = $request->getHeader('Origin');
    $referer = $request->getHeader('Referer');

    $isValid = false;
    if ($origin) {
      $isValid = in_array($origin, $this->allowedOrigins);
    } elseif ($referer) {
      $parsed = parse_url($referer);
      $isValid = in_array($parsed['scheme'] . '://' . $parsed['host'], $this->allowedOrigins);
    }

    if (!$isValid) {
      return Response::json(['error' => ['message' => 'Origin not allowed']], 403);
    }

    return $next($request);
  }
}
```

### Opción B: CSRF Token (más robusto)

**Backend: `src/Services/CsrfService.php`**

```php
<?php
namespace App\Services;

class CsrfService {
  public static function generateToken(): string {
    return bin2hex(random_bytes(32));
  }

  public static function validateToken(string $token, string $cookieToken): bool {
    return hash_equals($token, $cookieToken);
  }
}
```

**Backend: `src/Controllers/AuthController.php` (en login)**

```php
// Al hacer login, emitir CSRF token
$csrfToken = CsrfService::generateToken();
setcookie('csrf_token', $csrfToken, [
  'httponly' => false, // Debe ser accesible desde JS
  'secure' => true,
  'samesite' => 'Lax',
  'path' => '/'
]);
```

**Backend: `src/Middleware/CsrfMiddleware.php`**

```php
public function handle(Request $request, callable $next) {
  if (!in_array($request->getPath(), ['/api/v1/auth/refresh', '/api/v1/auth/logout'])) {
    return $next($request);
  }

  $headerToken = $request->getHeader('X-CSRF-Token');
  $cookieToken = $request->getCookie('csrf_token');

  if (!$headerToken || !$cookieToken || !CsrfService::validateToken($headerToken, $cookieToken)) {
    return Response::json(['error' => ['message' => 'Invalid CSRF token']], 403);
  }

  return $next($request);
}
```

**Frontend: `lib/api.js` (agregar header CSRF)**

```javascript
export async function apiRequest(url, options = {}) {
  // ... código existente ...
  
  // Obtener CSRF token de cookie (si existe)
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1];

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers,
    },
    credentials: 'include',
  };
  
  // ... resto del código ...
}
```

**Recomendación:** Empezar con Opción A (Origin check) por simplicidad, luego agregar Opción B si se requiere mayor seguridad.

---

## 3. Implementar "clasificación automática" en backend (Impacto: Altísimo, Esfuerzo: Bajo/Medio)

**Problema:** El valor para gerencia depende de ver rápido: vencidas / vence esta semana / próxima / sin fecha / completada.

**Ajuste:** Agregar campo derivado `due_bucket` en la respuesta JSON (no en la BD).

**Backend: `src/Resources/TaskResource.php`**

```php
<?php
namespace App\Resources;

use App\Models\Task;

class TaskResource {
  public static function toArray(Task $task): array {
    $dueBucket = self::calculateDueBucket($task);
    
    return [
      'id' => $task->id,
      'area_id' => $task->area_id,
      'area_name' => $task->area_name ?? null,
      'title' => $task->title,
      'description' => $task->description,
      'type' => $task->type,
      'priority' => $task->priority,
      'status' => $task->status,
      'progress_percent' => $task->progress_percent,
      'responsible_id' => $task->responsible_id,
      'responsible_name' => $task->responsible_name ?? null,
      'start_date' => $task->start_date,
      'due_date' => $task->due_date,
      'closed_date' => $task->closed_date,
      'due_bucket' => $dueBucket, // Campo derivado
      'created_at' => $task->created_at,
      'updated_at' => $task->updated_at,
    ];
  }

  private static function calculateDueBucket(Task $task): string {
    // Si está completada, siempre es COMPLETED
    if ($task->status === 'Completada') {
      return 'COMPLETED';
    }

    // Si no tiene fecha de vencimiento
    if (!$task->due_date) {
      return 'NO_DUE_DATE';
    }

    $today = new \DateTime();
    $dueDate = new \DateTime($task->due_date);
    $diff = $today->diff($dueDate);
    $days = (int)$diff->format('%r%a'); // Negativo si ya pasó

    // Vencida
    if ($days < 0) {
      return 'OVERDUE';
    }

    // Vence esta semana (0-7 días)
    if ($days <= 7) {
      return 'DUE_THIS_WEEK';
    }

    // Próxima (más de 7 días)
    return 'UPCOMING';
  }

  public static function collection(array $tasks): array {
    return array_map([self::class, 'toArray'], $tasks);
  }
}
```

**Alternativa en SQL (más eficiente para reportes):**

```sql
SELECT 
  t.*,
  CASE
    WHEN t.status = 'Completada' THEN 'COMPLETED'
    WHEN t.due_date IS NULL THEN 'NO_DUE_DATE'
    WHEN t.due_date < CURDATE() THEN 'OVERDUE'
    WHEN t.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'DUE_THIS_WEEK'
    ELSE 'UPCOMING'
  END AS due_bucket
FROM tasks t
```

**Resultado:** El dashboard gerencial sale "gratis", filtros consistentes, reduce discusiones de "por qué aquí dice vencida y allá no".

---

## 4. Evidencias como entidad real (Impacto: Alto, Esfuerzo: Bajo)

**Problema:** El documento pide "comentarios y evidencias (enlaces a documentos, archivos, etc.)". Hoy solo tienes comentarios.

**Ajuste mínimo de BD:**

```sql
CREATE TABLE task_evidences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,              -- URL del documento/archivo
  description VARCHAR(255) NULL,          -- Descripción opcional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (task_id)
);
```

**Backend: Nuevo endpoint**

```php
// src/Controllers/TaskController.php
public function addEvidence(Request $request, int $taskId) {
  $data = $request->getBody();
  $userCtx = $request->getAttribute('userContext');
  
  // Validar permisos (mismo que comentarios)
  $task = $this->taskService->getById($taskId, $userCtx);
  if (!$task) {
    return Response::json(['error' => ['message' => 'Task not found']], 404);
  }
  
  $evidence = $this->taskService->addEvidence($taskId, $userCtx['id'], $data['url'], $data['description'] ?? null);
  
  return Response::json(['data' => EvidenceResource::toArray($evidence)], 201);
}
```

**Backend: `src/Resources/TaskResource.php` (incluir evidencias)**

```php
public static function toArray(Task $task, array $evidences = []): array {
  return [
    // ... campos existentes ...
    'evidences' => array_map([EvidenceResource::class, 'toArray'], $evidences),
    'comments' => array_map([CommentResource::class, 'toArray'], $task->comments ?? []),
  ];
}
```

**Endpoint:**

- `POST /api/v1/tasks/{id}/evidences` (body: `{ "url": "...", "description": "..." }`)
- `GET /api/v1/tasks/{id}` devuelve evidencias + comentarios

**Resultado:** Sube muchísimo la percepción de "control" sin complicar.

---

## 5. Trazabilidad/auditoría básica (Impacto: Altísimo, Esfuerzo: Medio)

**Problema:** El documento remarca trazabilidad e historial (quién, cuándo, qué cambió). Solo con `updated_at` no alcanza.

**Ajuste:** Tabla `task_events` para registrar eventos clave.

```sql
CREATE TABLE task_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  event_type ENUM(
    'CREATED',
    'STATUS_CHANGED',
    'RESPONSIBLE_CHANGED',
    'PROGRESS_CHANGED',
    'COMMENT_ADDED',
    'EVIDENCE_ADDED',
    'DUE_DATE_CHANGED',
    'PRIORITY_CHANGED'
  ) NOT NULL,
  meta_json JSON NULL,                    -- Datos adicionales (valor anterior, nuevo valor, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (task_id),
  INDEX (created_at),
  INDEX (event_type)
);
```

**Backend: `src/Services/TaskService.php` (registrar eventos)**

```php
private function logEvent(int $taskId, int $userId, string $eventType, array $meta = []) {
  $this->taskEventRepository->create([
    'task_id' => $taskId,
    'user_id' => $userId,
    'event_type' => $eventType,
    'meta_json' => json_encode($meta),
  ]);
}

public function update(int $taskId, array $data, array $userCtx) {
  $task = $this->getById($taskId, $userCtx);
  
  // Detectar cambios
  if (isset($data['status']) && $data['status'] !== $task->status) {
    $this->logEvent($taskId, $userCtx['id'], 'STATUS_CHANGED', [
      'old' => $task->status,
      'new' => $data['status'],
    ]);
  }
  
  if (isset($data['responsible_id']) && $data['responsible_id'] != $task->responsible_id) {
    $this->logEvent($taskId, $userCtx['id'], 'RESPONSIBLE_CHANGED', [
      'old' => $task->responsible_id,
      'new' => $data['responsible_id'],
    ]);
  }
  
  // ... más cambios ...
  
  return $this->taskRepository->update($taskId, $data);
}
```

**Endpoint opcional:**

- `GET /api/v1/tasks/{id}/history` → lista de eventos ordenados por fecha

**Resultado:** Habilita después la "evolución de vencidas/semana" y auditoría completa.

---

## 6. Permisos "a prueba de errores" (Impacto: Alto, Esfuerzo: Bajo)

**Problema:** El riesgo real es que un filtro mal usado permita ver/editar tareas ajenas.

**Ajuste:** Centralizar función en backend tipo `TaskPolicy::scopeQuery()`.

**Backend: `src/Policies/TaskPolicy.php`**

```php
<?php
namespace App\Policies;

class TaskPolicy {
  public static function scopeQuery(array $userCtx, string $baseSql, array $params = []): array {
    $role = $userCtx['role'];
    $userId = $userCtx['id'];
    $areaId = $userCtx['area_id'] ?? null;

    $whereClauses = [];
    $finalParams = $params;

    switch ($role) {
      case 'admin':
      case 'gerencia':
        // Sin restricción
        break;

      case 'lider_area':
        if ($areaId) {
          $whereClauses[] = 't.area_id = :user_area_id';
          $finalParams[':user_area_id'] = $areaId;
        }
        break;

      case 'colaborador':
        $whereClauses[] = 't.responsible_id = :user_id';
        $finalParams[':user_id'] = $userId;
        break;
    }

    if (!empty($whereClauses)) {
      $baseSql .= ' AND ' . implode(' AND ', $whereClauses);
    }

    return ['sql' => $baseSql, 'params' => $finalParams];
  }

  public static function canUpdate(int $taskId, array $userCtx, $task): bool {
    $role = $userCtx['role'];
    
    if (in_array($role, ['admin', 'gerencia'])) {
      return true;
    }
    
    if ($role === 'lider_area' && $task->area_id == $userCtx['area_id']) {
      return true;
    }
    
    if ($role === 'colaborador' && $task->responsible_id == $userCtx['id']) {
      return true;
    }
    
    return false;
  }
}
```

**Backend: `src/Repositories/TaskRepository.php` (usar policy)**

```php
public function list(array $filters, array $userCtx, int $page = 1, int $perPage = 20) {
  $baseSql = "SELECT t.*, a.name as area_name, u.name as responsible_name 
              FROM tasks t
              LEFT JOIN areas a ON t.area_id = a.id
              LEFT JOIN users u ON t.responsible_id = u.id
              WHERE 1=1";
  
  $params = [];
  
  // Aplicar filtros
  if (isset($filters['status'])) {
    $baseSql .= " AND t.status = :status";
    $params[':status'] = $filters['status'];
  }
  
  // ... más filtros ...
  
  // Aplicar política de permisos
  $scoped = TaskPolicy::scopeQuery($userCtx, $baseSql, $params);
  
  // Ejecutar query con parámetros finales
  $stmt = $this->db->prepare($scoped['sql']);
  $stmt->execute($scoped['params']);
  
  return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}
```

**Resultado:** Permisos consistentes y a prueba de errores.

---

## 7. Paginación + filtros estandarizados desde el día 1 (Impacto: Alto, Esfuerzo: Bajo)

**Problema:** Necesitas filtros por área/estado/prioridad/fechas y "proyecto" (aunque sea el mismo concepto).

**Ajuste:** Definir contrato fijo para `GET /tasks`.

**Backend: `src/Controllers/TaskController.php`**

```php
public function index(Request $request) {
  $filters = [
    'status' => $request->getQuery('status'),
    'priority' => $request->getQuery('priority'),
    'type' => $request->getQuery('type'),
    'due_bucket' => $request->getQuery('due_bucket'), // OVERDUE, DUE_THIS_WEEK, etc.
    'area_id' => $request->getQuery('area_id') ? (int)$request->getQuery('area_id') : null,
    'responsible_id' => $request->getQuery('responsible_id') ? (int)$request->getQuery('responsible_id') : null,
    'q' => $request->getQuery('q'), // Búsqueda de texto (título, descripción)
  ];
  
  $page = max(1, (int)$request->getQuery('page', 1));
  $perPage = min(100, max(1, (int)$request->getQuery('per_page', 20)));
  $sort = $request->getQuery('sort', 'updated_at');
  $order = strtoupper($request->getQuery('order', 'DESC')) === 'ASC' ? 'ASC' : 'DESC';
  
  $userCtx = $request->getAttribute('userContext');
  
  $result = $this->taskService->list($filters, $userCtx, $page, $perPage, $sort, $order);
  
  return Response::json([
    'data' => TaskResource::collection($result['items']),
    'meta' => [
      'page' => $page,
      'per_page' => $perPage,
      'total' => $result['total'],
      'total_pages' => ceil($result['total'] / $perPage),
    ],
  ]);
}
```

**Respuesta estándar:**

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**Resultado:** Evita que el dashboard "se muera" cuando crezcan las tareas.

---

## 8. Índices compuestos orientados a reportes (Impacto: Alto, Esfuerzo: Bajo)

**Problema:** Tu índice suelto ayuda, pero para dashboard y filtros reales, los compuestos vuelan.

**Ajuste recomendado (mínimo):**

```sql
-- Para reportes por área + estado + fecha
CREATE INDEX idx_tasks_area_status_due ON tasks(area_id, status, due_date);

-- Para reportes por responsable + estado + fecha
CREATE INDEX idx_tasks_responsible_status_due ON tasks(responsible_id, status, due_date);

-- Para reportes generales por estado + fecha
CREATE INDEX idx_tasks_status_due ON tasks(status, due_date);

-- Para reportes por actualización (útil para "últimas actualizaciones")
CREATE INDEX idx_tasks_area_updated ON tasks(area_id, updated_at DESC);
```

**Resultado:** Consultas de reportes mucho más rápidas.

---

## 9. Mantener "área=proyecto" pero permitir clasificación (Impacto: Medio, Esfuerzo: Bajo)

**Ajuste simple:**

Mantén `type ENUM('AREA','PROYECTO')` en la tabla `areas`.

**Opcional (muy útil):** Agregar `parent_id` para que un "PROYECTO" cuelgue de un "AREA" sin crear otra entidad.

```sql
ALTER TABLE areas ADD COLUMN parent_id INT NULL;
ALTER TABLE areas ADD FOREIGN KEY (parent_id) REFERENCES areas(id);
```

**Ejemplo:**
- AREA: IT (id=1)
- PROYECTO: Migración Cloud (id=10, parent_id=1)

**Resultado:** Permite ordenar y filtrar mejor sin complicar el modelo.

---

## 10. Endurecer autenticación sin complicarla (Impacto: Alto, Esfuerzo: Bajo)

**Ajustes simples:**

### Rate limit en login (por IP + por usuario)

**Backend: `src/Middleware/RateLimitMiddleware.php`**

```php
<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class RateLimitMiddleware {
  private $maxAttempts = 5;
  private $windowMinutes = 15;
  
  public function handle(Request $request, callable $next) {
    if ($request->getPath() !== '/api/v1/auth/login') {
      return $next($request);
    }
    
    $ip = $request->getIp();
    $key = "login_attempts:{$ip}";
    
    // Usar Redis o archivo temporal para contar intentos
    $attempts = $this->getAttempts($key);
    
    if ($attempts >= $this->maxAttempts) {
      return Response::json([
        'error' => ['message' => 'Too many login attempts. Please try again later.']
      ], 429);
    }
    
    $response = $next($request);
    
    // Si falló el login, incrementar contador
    if ($response->getStatusCode() === 401) {
      $this->incrementAttempts($key);
    } else {
      $this->resetAttempts($key);
    }
    
    return $response;
  }
  
  private function getAttempts(string $key): int {
    // Implementar con Redis o archivo
    return 0;
  }
  
  private function incrementAttempts(string $key): void {
    // Implementar
  }
  
  private function resetAttempts(string $key): void {
    // Implementar
  }
}
```

### Refresh token rotativo

**Backend: `src/Controllers/AuthController.php` (en refresh)**

```php
public function refresh(Request $request) {
  $refreshToken = $request->getCookie('refresh_token');
  
  if (!$refreshToken) {
    return Response::json(['error' => ['message' => 'No refresh token']], 401);
  }
  
  // Validar y obtener usuario
  $tokenData = $this->authService->validateRefreshToken($refreshToken);
  
  // Invalidar el refresh token anterior
  $this->authService->revokeRefreshToken($refreshToken);
  
  // Generar nuevo par de tokens
  $newAccessToken = $this->jwtService->generateAccessToken($tokenData['user_id'], $tokenData['role'], $tokenData['area_id']);
  $newRefreshToken = $this->authService->generateRefreshToken($tokenData['user_id'], $request);
  
  // Establecer nuevo refresh token en cookie
  setcookie('refresh_token', $newRefreshToken, [
    'httponly' => true,
    'secure' => true,
    'samesite' => 'Lax',
    'expires' => time() + (getenv('JWT_REFRESH_TTL_DAYS') * 86400),
    'path' => '/',
  ]);
  
  return Response::json([
    'data' => ['access_token' => $newAccessToken]
  ]);
}
```

### `is_active` aplicado en middleware

**Backend: `src/Middleware/JwtAuthMiddleware.php`**

```php
public function handle(Request $request, callable $next) {
  $token = $this->extractToken($request);
  
  if (!$token) {
    return Response::json(['error' => ['message' => 'Unauthorized']], 401);
  }
  
  $payload = $this->jwtService->validate($token);
  $user = $this->userRepository->findById($payload['sub']);
  
  // Verificar que el usuario esté activo
  if (!$user || !$user->is_active) {
    return Response::json(['error' => ['message' => 'User account is inactive']], 403);
  }
  
  $request->setAttribute('userContext', [
    'id' => $user->id,
    'role' => $user->role->name,
    'area_id' => $user->area_id,
  ]);
  
  return $next($request);
}
```

**Resultado:** Acceso estable y seguro, reduciendo el caos de Excel.

---

## Orden Recomendado de Implementación (2 Sprints Cortos)

### Sprint 1 (Seguridad + Adopción)

1. **Sesión estable** (bootstrap + refresh-lock)
2. **CSRF/Origin check** en refresh/logout
3. **Filtros + paginación** + contrato de respuesta
4. **Clasificación automática** `due_bucket`

**Duración estimada:** 1-2 semanas

### Sprint 2 (Valor Gerencial Real)

5. **Evidencias** (tabla + endpoints)
6. **Trazabilidad** (`task_events`)
7. **Índices compuestos**
8. **Policy de permisos** "por query"

**Duración estimada:** 1-2 semanas

---

## Resumen de Impacto

| Ajuste | Impacto | Esfuerzo | Prioridad |
|--------|---------|----------|-----------|
| 1. Flujo de sesión | Altísimo | Bajo | 🔴 Crítica |
| 2. CSRF/Origin check | Alto | Bajo | 🟠 Alta |
| 3. Clasificación `due_bucket` | Altísimo | Bajo/Medio | 🔴 Crítica |
| 4. Evidencias | Alto | Bajo | 🟠 Alta |
| 5. Trazabilidad | Altísimo | Medio | 🟠 Alta |
| 6. Permisos a prueba de errores | Alto | Bajo | 🟠 Alta |
| 7. Paginación + filtros | Alto | Bajo | 🟠 Alta |
| 8. Índices compuestos | Alto | Bajo | 🟡 Media |
| 9. Área=Proyecto con parent_id | Medio | Bajo | 🟡 Media |
| 10. Endurecer autenticación | Alto | Bajo | 🟠 Alta |

