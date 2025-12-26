# Roles y Permisos del Sistema de Gestión de Tareas

Este documento describe los roles disponibles en el sistema y los permisos de acceso asociados a cada uno.

---

## Roles Disponibles

El sistema cuenta con 4 roles principales:

1. **admin** - Administrador del sistema
2. **gerencia** - Gerencia
3. **lider_area** - Líder de área
4. **colaborador** - Colaborador

---

## 1. Administrador (admin)

### Descripción
Rol con acceso completo al sistema. Puede gestionar usuarios, áreas, tareas y acceder a todos los reportes y funcionalidades.

### Acceso a Páginas del Frontend

#### Páginas Básicas (Acceso Universal)
- ✅ **Dashboard** (`/dashboard`) - Todas las Tareas
- ✅ **Mis Tareas** (`/my-tasks`) - Vista de hoja de cálculo
- ✅ **Asignaciones** (`/assignments`) - Asignaciones recibidas y enviadas

#### Páginas de Reportes
- ✅ **Reportes Diarios** (`/reports/daily`) - Reporte diario de tareas
- ✅ **Dashboard por Área** (`/reports/areas`) - Dashboard de áreas
- ✅ **Descargar Reportes** (`/reports/download`) - Generación y descarga de reportes
- ✅ **Dashboard General** (`/reports/management`) - Dashboard gerencial completo

#### Páginas de Administración
- ✅ **Áreas** (`/admin/areas`) - Gestión de áreas (crear, editar, eliminar)
- ✅ **Usuarios** (`/admin/users`) - Gestión de usuarios (crear, editar, eliminar, activar/desactivar)

### Acceso a Endpoints de la API

#### Autenticación
- ✅ `POST /api/v1/auth/login` - Iniciar sesión
- ✅ `POST /api/v1/auth/refresh` - Renovar token
- ✅ `GET /api/v1/auth/me` - Obtener información del usuario
- ✅ `POST /api/v1/auth/logout` - Cerrar sesión

#### Tareas
- ✅ `GET /api/v1/tasks` - Listar todas las tareas (sin restricciones)
- ✅ `POST /api/v1/tasks` - Crear tareas
- ✅ `GET /api/v1/tasks/{id}` - Ver cualquier tarea
- ✅ `PUT /api/v1/tasks/{id}` - Editar cualquier tarea
- ✅ `DELETE /api/v1/tasks/{id}` - Eliminar cualquier tarea

#### Administración
- ✅ `GET /api/v1/areas` - Listar todas las áreas
- ✅ `POST /api/v1/areas` - Crear área
- ✅ `PUT /api/v1/areas/{id}` - Actualizar área
- ✅ `DELETE /api/v1/areas/{id}` - Eliminar área
- ✅ `GET /api/v1/users` - Listar todos los usuarios
- ✅ `POST /api/v1/users` - Crear usuario
- ✅ `PUT /api/v1/users/{id}` - Actualizar usuario
- ✅ `DELETE /api/v1/users/{id}` - Eliminar usuario
- ✅ `GET /api/v1/roles` - Listar roles disponibles

#### Reportes
- ✅ `GET /api/v1/reports/daily` - Reporte diario (todas las áreas)
- ✅ `GET /api/v1/reports/management` - Dashboard gerencial
- ✅ `GET /api/v1/reports/weekly-evolution` - Evolución semanal
- ✅ `GET /api/v1/reports/quarterly` - Cumplimiento trimestral
- ✅ `GET /api/v1/reports/advanced-stats` - Estadísticas avanzadas

#### Asignaciones
- ✅ `GET /api/v1/assignments/my` - Asignaciones recibidas
- ✅ `GET /api/v1/assignments/sent` - Asignaciones enviadas
- ✅ `POST /api/v1/assignments` - Crear asignación
- ✅ `PUT /api/v1/assignments/{id}/read` - Marcar como leída
- ✅ `DELETE /api/v1/assignments/{id}` - Eliminar asignación
- ✅ `GET /api/v1/users/list` - Listar usuarios para asignar

### Restricciones
- ❌ Ninguna restricción de acceso

---

## 2. Gerencia (gerencia)

### Descripción
Rol de nivel gerencial con acceso a todas las tareas y reportes consolidados, pero sin permisos de administración de usuarios y áreas.

### Acceso a Páginas del Frontend

#### Páginas Básicas (Acceso Universal)
- ✅ **Dashboard** (`/dashboard`) - Todas las Tareas
- ✅ **Mis Tareas** (`/my-tasks`) - Vista de hoja de cálculo
- ✅ **Asignaciones** (`/assignments`) - Asignaciones recibidas y enviadas

#### Páginas de Reportes
- ✅ **Reportes Diarios** (`/reports/daily`) - Reporte diario de tareas
- ✅ **Dashboard por Área** (`/reports/areas`) - Dashboard de áreas
- ✅ **Descargar Reportes** (`/reports/download`) - Generación y descarga de reportes
- ✅ **Dashboard General** (`/reports/management`) - Dashboard gerencial completo

#### Páginas de Administración
- ❌ **Áreas** (`/admin/areas`) - Sin acceso
- ❌ **Usuarios** (`/admin/users`) - Sin acceso

### Acceso a Endpoints de la API

#### Autenticación
- ✅ `POST /api/v1/auth/login` - Iniciar sesión
- ✅ `POST /api/v1/auth/refresh` - Renovar token
- ✅ `GET /api/v1/auth/me` - Obtener información del usuario
- ✅ `POST /api/v1/auth/logout` - Cerrar sesión

#### Tareas
- ✅ `GET /api/v1/tasks` - Listar todas las tareas (sin restricciones)
- ✅ `POST /api/v1/tasks` - Crear tareas
- ✅ `GET /api/v1/tasks/{id}` - Ver cualquier tarea
- ✅ `PUT /api/v1/tasks/{id}` - Editar cualquier tarea
- ✅ `DELETE /api/v1/tasks/{id}` - Eliminar cualquier tarea

#### Administración
- ✅ `GET /api/v1/areas` - Listar todas las áreas (solo lectura)
- ❌ `POST /api/v1/areas` - Sin permiso para crear
- ❌ `PUT /api/v1/areas/{id}` - Sin permiso para editar
- ❌ `DELETE /api/v1/areas/{id}` - Sin permiso para eliminar
- ❌ `GET /api/v1/users` - Sin acceso
- ❌ `POST /api/v1/users` - Sin acceso
- ❌ `PUT /api/v1/users/{id}` - Sin acceso
- ❌ `DELETE /api/v1/users/{id}` - Sin acceso
- ✅ `GET /api/v1/roles` - Listar roles disponibles

#### Reportes
- ✅ `GET /api/v1/reports/daily` - Reporte diario (todas las áreas)
- ✅ `GET /api/v1/reports/management` - Dashboard gerencial
- ✅ `GET /api/v1/reports/weekly-evolution` - Evolución semanal
- ✅ `GET /api/v1/reports/quarterly` - Cumplimiento trimestral
- ✅ `GET /api/v1/reports/advanced-stats` - Estadísticas avanzadas

#### Asignaciones
- ✅ `GET /api/v1/assignments/my` - Asignaciones recibidas
- ✅ `GET /api/v1/assignments/sent` - Asignaciones enviadas
- ✅ `POST /api/v1/assignments` - Crear asignación
- ✅ `PUT /api/v1/assignments/{id}/read` - Marcar como leída
- ✅ `DELETE /api/v1/assignments/{id}` - Eliminar asignación
- ✅ `GET /api/v1/users/list` - Listar usuarios para asignar

### Restricciones
- ❌ No puede crear, editar o eliminar áreas
- ❌ No puede gestionar usuarios
- ✅ Puede ver todas las tareas de todas las áreas
- ✅ Acceso completo a reportes y dashboards

---

## 3. Líder de Área (lider_area)

### Descripción
Rol para líderes de área que pueden gestionar tareas y ver reportes únicamente de su área asignada.

### Acceso a Páginas del Frontend

#### Páginas Básicas (Acceso Universal)
- ✅ **Dashboard** (`/dashboard`) - Tareas filtradas por su área
- ✅ **Mis Tareas** (`/my-tasks`) - Vista de hoja de cálculo (sus tareas)
- ✅ **Asignaciones** (`/assignments`) - Asignaciones recibidas y enviadas

#### Páginas de Reportes
- ✅ **Reportes Diarios** (`/reports/daily`) - Reporte diario de su área
- ✅ **Dashboard por Área** (`/reports/areas`) - Dashboard de su área
- ✅ **Descargar Reportes** (`/reports/download`) - Generación y descarga de reportes de su área

#### Páginas de Reportes (Sin Acceso)
- ❌ **Dashboard General** (`/reports/management`) - Sin acceso

#### Páginas de Administración
- ❌ **Áreas** (`/admin/areas`) - Sin acceso
- ❌ **Usuarios** (`/admin/users`) - Sin acceso

### Acceso a Endpoints de la API

#### Autenticación
- ✅ `POST /api/v1/auth/login` - Iniciar sesión
- ✅ `POST /api/v1/auth/refresh` - Renovar token
- ✅ `GET /api/v1/auth/me` - Obtener información del usuario
- ✅ `POST /api/v1/auth/logout` - Cerrar sesión

#### Tareas
- ✅ `GET /api/v1/tasks` - Listar tareas **solo de su área** (filtrado automático por `area_id`)
- ✅ `POST /api/v1/tasks` - Crear tareas (puede asignar a cualquier usuario de su área)
- ✅ `GET /api/v1/tasks/{id}` - Ver tareas **solo de su área**
- ✅ `PUT /api/v1/tasks/{id}` - Editar tareas **solo de su área**
- ✅ `DELETE /api/v1/tasks/{id}` - Eliminar tareas **solo de su área**

#### Administración
- ✅ `GET /api/v1/areas` - Listar todas las áreas (solo lectura)
- ❌ `POST /api/v1/areas` - Sin permiso para crear
- ❌ `PUT /api/v1/areas/{id}` - Sin permiso para editar
- ❌ `DELETE /api/v1/areas/{id}` - Sin permiso para eliminar
- ❌ `GET /api/v1/users` - Sin acceso
- ❌ `POST /api/v1/users` - Sin acceso
- ❌ `PUT /api/v1/users/{id}` - Sin acceso
- ❌ `DELETE /api/v1/users/{id}` - Sin acceso
- ✅ `GET /api/v1/roles` - Listar roles disponibles

#### Reportes
- ✅ `GET /api/v1/reports/daily` - Reporte diario **filtrado automáticamente por su área**
- ❌ `GET /api/v1/reports/management` - Sin acceso (solo admin y gerencia)
- ❌ `GET /api/v1/reports/weekly-evolution` - Sin acceso
- ❌ `GET /api/v1/reports/quarterly` - Sin acceso
- ❌ `GET /api/v1/reports/advanced-stats` - Sin acceso

#### Asignaciones
- ✅ `GET /api/v1/assignments/my` - Asignaciones recibidas
- ✅ `GET /api/v1/assignments/sent` - Asignaciones enviadas
- ✅ `POST /api/v1/assignments` - Crear asignación
- ✅ `PUT /api/v1/assignments/{id}/read` - Marcar como leída
- ✅ `DELETE /api/v1/assignments/{id}` - Eliminar asignación
- ✅ `GET /api/v1/users/list` - Listar usuarios para asignar

### Restricciones
- ❌ Solo puede ver y gestionar tareas de su área asignada
- ❌ No puede acceder a reportes gerenciales globales
- ❌ No puede gestionar áreas ni usuarios
- ✅ Puede crear tareas y asignarlas a usuarios de su área
- ✅ Puede ver reportes diarios y dashboards de su área

---

## 4. Colaborador (colaborador)

### Descripción
Rol básico para colaboradores que solo pueden ver y gestionar sus propias tareas asignadas.

### Acceso a Páginas del Frontend

#### Páginas Básicas (Acceso Universal)
- ✅ **Dashboard** (`/dashboard`) - Solo sus tareas asignadas
- ✅ **Mis Tareas** (`/my-tasks`) - Vista de hoja de cálculo (sus tareas)
- ✅ **Asignaciones** (`/assignments`) - Asignaciones recibidas y enviadas

#### Páginas de Reportes (Sin Acceso)
- ❌ **Reportes Diarios** (`/reports/daily`) - Sin acceso
- ❌ **Dashboard por Área** (`/reports/areas`) - Sin acceso
- ❌ **Descargar Reportes** (`/reports/download`) - Sin acceso
- ❌ **Dashboard General** (`/reports/management`) - Sin acceso

#### Páginas de Administración
- ❌ **Áreas** (`/admin/areas`) - Sin acceso
- ❌ **Usuarios** (`/admin/users`) - Sin acceso

### Acceso a Endpoints de la API

#### Autenticación
- ✅ `POST /api/v1/auth/login` - Iniciar sesión
- ✅ `POST /api/v1/auth/refresh` - Renovar token
- ✅ `GET /api/v1/auth/me` - Obtener información del usuario
- ✅ `POST /api/v1/auth/logout` - Cerrar sesión

#### Tareas
- ✅ `GET /api/v1/tasks` - Listar **solo sus tareas asignadas** (filtrado automático por `responsible_id`)
- ✅ `POST /api/v1/tasks` - Crear tareas (puede asignarse a sí mismo o a otros)
- ✅ `GET /api/v1/tasks/{id}` - Ver tareas **solo si es responsable** (`responsible_id`)
- ✅ `PUT /api/v1/tasks/{id}` - Editar tareas **solo si es responsable**
- ✅ `DELETE /api/v1/tasks/{id}` - Eliminar tareas **solo si es responsable**

#### Administración
- ✅ `GET /api/v1/areas` - Listar todas las áreas (solo lectura)
- ❌ `POST /api/v1/areas` - Sin permiso para crear
- ❌ `PUT /api/v1/areas/{id}` - Sin permiso para editar
- ❌ `DELETE /api/v1/areas/{id}` - Sin permiso para eliminar
- ❌ `GET /api/v1/users` - Sin acceso
- ❌ `POST /api/v1/users` - Sin acceso
- ❌ `PUT /api/v1/users/{id}` - Sin acceso
- ❌ `DELETE /api/v1/users/{id}` - Sin acceso
- ✅ `GET /api/v1/roles` - Listar roles disponibles

#### Reportes
- ❌ `GET /api/v1/reports/daily` - Sin acceso
- ❌ `GET /api/v1/reports/management` - Sin acceso
- ❌ `GET /api/v1/reports/weekly-evolution` - Sin acceso
- ❌ `GET /api/v1/reports/quarterly` - Sin acceso
- ❌ `GET /api/v1/reports/advanced-stats` - Sin acceso

#### Asignaciones
- ✅ `GET /api/v1/assignments/my` - Asignaciones recibidas
- ✅ `GET /api/v1/assignments/sent` - Asignaciones enviadas
- ✅ `POST /api/v1/assignments` - Crear asignación
- ✅ `PUT /api/v1/assignments/{id}/read` - Marcar como leída
- ✅ `DELETE /api/v1/assignments/{id}` - Eliminar asignación
- ✅ `GET /api/v1/users/list` - Listar usuarios para asignar

### Restricciones
- ❌ Solo puede ver y gestionar tareas donde es responsable (`responsible_id`)
- ❌ No puede acceder a ningún reporte
- ❌ No puede gestionar áreas ni usuarios
- ✅ Puede crear tareas y asignarlas
- ✅ Puede gestionar sus propias tareas (editar, eliminar)

---

## Resumen de Permisos por Rol

| Funcionalidad | Admin | Gerencia | Líder de Área | Colaborador |
|--------------|-------|----------|---------------|-------------|
| **Ver todas las tareas** | ✅ | ✅ | ❌ (solo su área) | ❌ (solo propias) |
| **Crear tareas** | ✅ | ✅ | ✅ (su área) | ✅ |
| **Editar/Eliminar tareas** | ✅ (todas) | ✅ (todas) | ✅ (su área) | ✅ (solo propias) |
| **Gestionar áreas** | ✅ | ❌ | ❌ | ❌ |
| **Gestionar usuarios** | ✅ | ❌ | ❌ | ❌ |
| **Reportes diarios** | ✅ (todas) | ✅ (todas) | ✅ (su área) | ❌ |
| **Dashboard gerencial** | ✅ | ✅ | ❌ | ❌ |
| **Dashboard por área** | ✅ | ✅ | ✅ (su área) | ❌ |
| **Descargar reportes** | ✅ | ✅ | ✅ (su área) | ❌ |
| **Asignaciones** | ✅ | ✅ | ✅ | ✅ |

---

## Notas Importantes

### Filtrado Automático en Backend

El sistema aplica filtros automáticos según el rol del usuario:

- **Admin y Gerencia**: No se aplican filtros, ven todas las tareas
- **Líder de Área**: Filtro automático por `area_id` del usuario
- **Colaborador**: Filtro automático por `responsible_id` del usuario

Estos filtros se aplican en:
- `TaskRepository::findAll()`
- `TaskRepository::findById()`
- `ReportService::getDailyReport()`

### Seguridad

- Todos los endpoints (excepto login y refresh) requieren autenticación JWT
- Los permisos se validan tanto en el frontend (ocultando opciones) como en el backend (validando en cada request)
- El middleware `RoleMiddleware` bloquea el acceso a endpoints restringidos
- Los repositorios aplican filtros SQL adicionales según el rol del usuario

### Recuperación de Contraseña

Todos los roles tienen acceso a:
- `POST /api/v1/auth/password/forgot` - Solicitar código OTP
- `POST /api/v1/auth/password/verify-otp` - Verificar código OTP
- `POST /api/v1/auth/password/reset` - Cambiar contraseña

Estos endpoints son públicos y no requieren autenticación.

---

**Última actualización**: Diciembre 2024

